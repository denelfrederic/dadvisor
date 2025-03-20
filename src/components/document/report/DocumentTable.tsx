
import React from "react";
import { Check, X, FileText, FileImage, FileArchive, Database } from "lucide-react";
import { DocumentIndexationStatus } from "../hooks/useIndexationReport";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFileSize } from "../utils";

interface DocumentTableProps {
  documents: DocumentIndexationStatus[];
  loading?: boolean;
  onViewDetails?: (documentId: string) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({ documents, loading = false, onViewDetails }) => {
  const getDocumentIcon = (type: string) => {
    if (type.includes("image")) return <FileImage className="h-4 w-4" />;
    if (type.includes("pdf")) return <FileArchive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="border rounded-md p-4 text-center">
        <p className="text-muted-foreground">Chargement des documents...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Taille</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Embedding</TableHead>
            <TableHead className="text-center">Pinecone</TableHead>
            {onViewDetails && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                Aucun document trouvé
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getDocumentIcon(doc.type)}
                    <span className="truncate max-w-[150px]">{doc.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {doc.type}
                </TableCell>
                <TableCell>{formatFileSize(doc.size)}</TableCell>
                <TableCell className="text-xs">
                  {formatDate(doc.created_at)}
                </TableCell>
                <TableCell className="text-center">
                  {doc.hasEmbedding ? (
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {doc.pineconeIndexed ? (
                    <Database className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  )}
                </TableCell>
                {onViewDetails && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(doc.id)}
                    >
                      Détails
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentTable;
