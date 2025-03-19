
import { renderHook, act } from '@testing-library/react-hooks';
import { useIndexationReport } from '../useIndexationReport';
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

describe('useIndexationReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useIndexationReport());
    
    expect(result.current.report).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.logs).toEqual([]);
  });

  it('should add logs correctly', () => {
    const { result } = renderHook(() => useIndexationReport());
    
    act(() => {
      result.current.addLog('Test log message');
    });
    
    expect(result.current.logs.length).toBe(1);
    expect(result.current.logs[0]).toContain('Test log message');
  });

  it('should clear logs correctly', () => {
    const { result } = renderHook(() => useIndexationReport());
    
    act(() => {
      result.current.addLog('Test log message 1');
      result.current.addLog('Test log message 2');
      result.current.clearLogs();
    });
    
    expect(result.current.logs.length).toBe(1); // Will have the "Logs effacés" message
  });

  it('should handle empty document list correctly', async () => {
    // Mock the Supabase response for empty documents
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useIndexationReport());
    
    act(() => {
      result.current.generateReport();
    });
    
    // Wait for the async operation to complete
    await waitForNextUpdate();
    
    expect(result.current.report).toEqual({
      totalDocuments: 0,
      documentsWithEmbeddings: 0,
      documentsWithoutEmbeddings: 0,
      embeddingsPercentage: 0,
      documentsByType: {},
      recentDocuments: []
    });
  });

  it('should calculate report stats correctly with mock data', async () => {
    // Mock documents with and without embeddings
    const mockDocuments = [
      { id: '1', title: 'Doc 1', type: 'pdf', embedding: [0.1, 0.2], created_at: '2023-01-01', size: 1000 },
      { id: '2', title: 'Doc 2', type: 'pdf', embedding: null, created_at: '2023-01-02', size: 2000 },
      { id: '3', title: 'Doc 3', type: 'docx', embedding: [0.3, 0.4], created_at: '2023-01-03', size: 3000 }
    ];
    
    // Mock the Supabase response
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockDocuments,
          error: null
        })
      })
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useIndexationReport());
    
    act(() => {
      result.current.generateReport();
    });
    
    // Wait for the async operation to complete
    await waitForNextUpdate();
    
    // Verify the report calculation
    expect(result.current.report?.totalDocuments).toBe(3);
    expect(result.current.report?.documentsWithEmbeddings).toBe(2);
    expect(result.current.report?.documentsWithoutEmbeddings).toBe(1);
    expect(result.current.report?.embeddingsPercentage).toBe(67); // 2/3 = ~67%
    expect(result.current.report?.documentsByType).toEqual({ pdf: 2, docx: 1 });
    expect(result.current.report?.recentDocuments.length).toBe(3);
  });

  it('should handle errors correctly', async () => {
    // Mock Supabase error
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      })
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useIndexationReport());
    
    act(() => {
      result.current.generateReport();
    });
    
    // Wait for the async operation to complete
    await waitForNextUpdate();
    
    expect(result.current.error).toBe('Erreur lors de la récupération des documents: Database error');
    expect(result.current.report).toBeNull();
  });
});
