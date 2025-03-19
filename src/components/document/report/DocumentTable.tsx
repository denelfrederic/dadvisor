
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DocumentIndexationStatus } from "../hooks/useIndexationReport";
import { formatFileSize } from "../utils";

interface DocumentTableProps {
  documents: DocumentIndexationStatus[];
}

const DocumentTable: React.FC<DocumentTableProps> = ({ documents }) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Embedding</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Taille</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>
                  {doc.hasEmbedding ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Oui</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">Non</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{formatFileSize(doc.size)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                Aucun document trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentTable;
