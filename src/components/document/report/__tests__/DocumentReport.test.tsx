
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentReport from '../DocumentReport';
import { useIndexationReport } from '../../hooks/useIndexationReport';

// Mock the useIndexationReport hook
jest.mock('../../hooks/useIndexationReport');

describe('DocumentReport', () => {
  const mockGenerateReport = jest.fn();
  const mockExportReport = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useIndexationReport as jest.Mock).mockReturnValue({
      report: null,
      isLoading: false,
      error: null,
      generateReport: mockGenerateReport
    });
  });
  
  it('renders empty state when no report is available', () => {
    render(<DocumentReport />);
    
    expect(screen.getByText(/Aucun rapport disponible/i)).toBeInTheDocument();
  });
  
  it('calls generateReport when button is clicked', () => {
    render(<DocumentReport />);
    
    const generateButton = screen.getByRole('button', { name: /Générer le rapport/i });
    fireEvent.click(generateButton);
    
    expect(mockGenerateReport).toHaveBeenCalledTimes(1);
  });
  
  it('displays loading state correctly', () => {
    (useIndexationReport as jest.Mock).mockReturnValue({
      report: null,
      isLoading: true,
      error: null,
      generateReport: mockGenerateReport
    });
    
    render(<DocumentReport />);
    
    expect(screen.getByText(/Analyse en cours/i)).toBeInTheDocument();
  });
  
  it('renders report components when report is available', () => {
    const mockReport = {
      totalDocuments: 10,
      documentsWithEmbeddings: 7,
      documentsWithoutEmbeddings: 3,
      embeddingsPercentage: 70,
      documentsByType: { pdf: 5, docx: 3, txt: 2 },
      recentDocuments: [
        { id: '1', title: 'Doc 1', type: 'pdf', hasEmbedding: true, created_at: '2023-01-01', size: 1000 }
      ]
    };
    
    (useIndexationReport as jest.Mock).mockReturnValue({
      report: mockReport,
      isLoading: false,
      error: null,
      generateReport: mockGenerateReport
    });
    
    render(<DocumentReport />);
    
    expect(screen.getByText('10')).toBeInTheDocument(); // Total documents
    expect(screen.getByText('7')).toBeInTheDocument(); // Documents with embeddings
    expect(screen.getByText('3')).toBeInTheDocument(); // Documents without embeddings
    expect(screen.getByText('70%')).toBeInTheDocument(); // Embedding percentage
  });
  
  it('renders error message when there is an error', () => {
    (useIndexationReport as jest.Mock).mockReturnValue({
      report: null,
      isLoading: false,
      error: 'Failed to fetch documents',
      generateReport: mockGenerateReport
    });
    
    render(<DocumentReport />);
    
    expect(screen.getByText(/Failed to fetch documents/i)).toBeInTheDocument();
  });
});
