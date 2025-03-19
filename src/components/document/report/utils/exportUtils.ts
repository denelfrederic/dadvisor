
import { DocumentIndexationStatus } from "../../hooks/useIndexationReport";
import { formatFileSize } from "../../utils";

/**
 * Exports document report data to CSV
 */
export const exportReportToCSV = (documents: DocumentIndexationStatus[]) => {
  if (!documents || documents.length === 0) return;
  
  const headers = "Titre,Type,Statut Embedding,Date,Taille\n";
  const csvContent = documents.map(doc => {
    return `"${doc.title.replace(/"/g, '""')}","${doc.type}","${doc.hasEmbedding ? 'Oui' : 'Non'}","${new Date(doc.created_at).toLocaleString()}","${formatFileSize(doc.size)}"`;
  }).join("\n");
  
  const csv = headers + csvContent;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rapport-indexation-documents-${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
