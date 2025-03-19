
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertTriangle } from "lucide-react";
import { DocumentIndexationStatus } from "../hooks/useIndexationReport";
import DocumentDetailDialog from "../DocumentDetailDialog";

interface DocumentTableProps {
  documents: DocumentIndexationStatus[];
}

const DocumentTable: React.FC<DocumentTableProps> = ({ documents }) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const openDetailDialog = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedDocumentId(null);
  };

  if (documents.length === 0) {
    return <p className="text-center text-muted-foreground py-4">Aucun document disponible</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-medium text-sm">Titre</th>
              <th className="text-left py-2 px-3 font-medium text-sm">Type</th>
              <th className="text-center py-2 px-3 font-medium text-sm">Embedding</th>
              <th className="text-left py-2 px-3 font-medium text-sm">Date</th>
              <th className="text-right py-2 px-3 font-medium text-sm">Taille</th>
              <th className="text-right py-2 px-3 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b hover:bg-accent/5">
                <td className="py-2 px-3 truncate max-w-[200px]">{doc.title}</td>
                <td className="py-2 px-3">{doc.type}</td>
                <td className="py-2 px-3 text-center">
                  {doc.hasEmbedding ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Oui
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Non
                    </Badge>
                  )}
                </td>
                <td className="py-2 px-3">{new Date(doc.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-3 text-right">
                  {doc.size >= 1024 * 1024
                    ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${(doc.size / 1024).toFixed(2)} KB`}
                </td>
                <td className="py-2 px-3 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openDetailDialog(doc.id)}
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocumentDetailDialog
        documentId={selectedDocumentId}
        isOpen={isDetailDialogOpen}
        onClose={closeDetailDialog}
      />
    </>
  );
};

export default DocumentTable;
