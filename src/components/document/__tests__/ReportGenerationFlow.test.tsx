
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportTab from '../tabs/ReportTab';
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  }
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('Report Generation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should show empty state initially and generate report on button click', async () => {
    // First return empty documents for initial state
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    });
    
    const { rerender } = render(<ReportTab />);
    
    // Verify empty state
    expect(screen.getByText(/Aucun rapport disponible/i)).toBeInTheDocument();
    
    // Mock data for report generation
    const mockDocuments = [
      { 
        id: '1', 
        title: 'Document test 1.pdf', 
        type: 'application/pdf', 
        embedding: [0.1, 0.2], 
        created_at: '2023-01-01', 
        size: 1000 
      },
      { 
        id: '2', 
        title: 'Document test 2.docx', 
        type: 'application/docx', 
        embedding: null, 
        created_at: '2023-01-02', 
        size: 2000 
      },
    ];
    
    // Setup mock for second call
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockDocuments,
          error: null
        })
      })
    });
    
    // Click generate report button
    const generateButton = screen.getByRole('button', { name: /Générer le rapport/i });
    fireEvent.click(generateButton);
    
    // Wait for report to be generated
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total documents
    });
    
    // Verify report content
    expect(screen.getByText('1')).toBeInTheDocument(); // Documents with embeddings
    expect(screen.getByText('1')).toBeInTheDocument(); // Documents without embeddings
    expect(screen.getByText('50%')).toBeInTheDocument(); // Embedding percentage
  });
  
  it('should handle error state correctly', async () => {
    // Mock error response
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection error' }
        })
      })
    });
    
    render(<ReportTab />);
    
    // Click generate report button
    const generateButton = screen.getByRole('button', { name: /Générer le rapport/i });
    fireEvent.click(generateButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Database connection error/i)).toBeInTheDocument();
    });
  });
});
