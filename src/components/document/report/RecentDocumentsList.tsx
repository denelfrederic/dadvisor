
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileWarning } from "lucide-react";
import { DocumentIndexationStatus } from "../hooks/useIndexationReport";
import { formatFileSize } from "../utils";

interface RecentDocumentsListProps {
  documents: DocumentIndexationStatus[];
  onExport: () => void;
}

const RecentDocumentsList = ({ documents, onExport }: RecentDocumentsListProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Documents récents</h3>
        {documents.length > 0 && (
          <Button onClick={onExport} variant="ghost" size="sm">
            <Download className="h-3 w-3 mr-1" />
            Exporter CSV
          </Button>
        )}
      </div>
      
      <div className="border rounded-md">
        <div className="grid grid-cols-12 gap-2 p-2 border-b bg-muted/50 text-xs font-medium">
          <div className="col-span-5">Titre</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Embedding</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Taille</div>
        </div>
        
        <ScrollArea className="h-[280px]">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div 
                key={doc.id} 
                className="grid grid-cols-12 gap-2 p-2 border-b text-xs hover:bg-muted/20"
              >
                <div className="col-span-5 truncate" title={doc.title}>{doc.title}</div>
                <div className="col-span-2">{doc.type}</div>
                <div className="col-span-2">
                  {doc.hasEmbedding ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Oui
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Non
                    </Badge>
                  )}
                </div>
                <div className="col-span-2">{new Date(doc.created_at).toLocaleDateString()}</div>
                <div className="col-span-1">{formatFileSize(doc.size)}</div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-center p-4 text-muted-foreground">
              <FileWarning className="h-8 w-8 mb-2 text-muted-foreground/60" />
              <p>Aucun document trouvé</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default RecentDocumentsList;
