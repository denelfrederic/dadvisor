
import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentTypeDistribution from '../DocumentTypeDistribution';

describe('DocumentTypeDistribution', () => {
  it('renders document types and counts correctly', () => {
    const documentsByType = {
      'application/pdf': 5,
      'application/docx': 3,
      'text/plain': 2
    };
    
    render(<DocumentTypeDistribution documentsByType={documentsByType} />);
    
    // Check title
    expect(screen.getByText('Répartition par type')).toBeInTheDocument();
    
    // Check document types
    expect(screen.getByText('application/pdf')).toBeInTheDocument();
    expect(screen.getByText('application/docx')).toBeInTheDocument();
    expect(screen.getByText('text/plain')).toBeInTheDocument();
    
    // Check counts
    expect(screen.getByText('5 document(s)')).toBeInTheDocument();
    expect(screen.getByText('3 document(s)')).toBeInTheDocument();
    expect(screen.getByText('2 document(s)')).toBeInTheDocument();
  });
  
  it('renders unknown for empty type values', () => {
    const documentsByType = {
      'application/pdf': 3,
      '': 2
    };
    
    render(<DocumentTypeDistribution documentsByType={documentsByType} />);
    
    expect(screen.getByText('Inconnu')).toBeInTheDocument();
    expect(screen.getByText('2 document(s)')).toBeInTheDocument();
  });
  
  it('handles empty document types object', () => {
    render(<DocumentTypeDistribution documentsByType={{}} />);
    
    expect(screen.getByText('Répartition par type')).toBeInTheDocument();
    // There should be no document types listed
    expect(screen.queryByText('document(s)')).not.toBeInTheDocument();
  });
});
