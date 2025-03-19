
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Check, Database, FileText, Loader2, RefreshCw } from "lucide-react";
import { formatFileSize } from "./utils";
import { toast } from "sonner";

const IndexedDocumentsList = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndexedDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer tous les documents indexés dans Pinecone
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, type, size, created_at, embedding, pinecone_indexed')
        .eq('pinecone_indexed', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDocuments(data || []);
      console.log(`${data?.length || 0} documents indexés récupérés`);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des documents indexés:", err);
      setError("Impossible de récupérer les documents indexés. Veuillez réessayer.");
      toast.error("Erreur: " + (err.message || "Impossible de récupérer les documents"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexedDocuments();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Documents indexés dans Pinecone</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchIndexedDocuments}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Rafraîchir
        </Button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Taille</TableHead>
              <TableHead>Date d'indexation</TableHead>
              <TableHead className="text-center">Status Pinecone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Chargement des documents indexés...
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun document indexé dans Pinecone n'a été trouvé.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[250px]" title={doc.title}>
                        {doc.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {doc.type || "Inconnu"}
                  </TableCell>
                  <TableCell>{doc.size ? formatFileSize(doc.size) : "N/A"}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {doc.pinecone_indexed ? (
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <Database className="h-4 w-4" />
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Non indexé</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground mt-4">
        Total: {documents.length} document{documents.length !== 1 ? 's' : ''} indexé{documents.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default IndexedDocumentsList;
