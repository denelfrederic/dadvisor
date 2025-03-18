import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processDocument } from "../chat/services/documentService";
import { formatFileSize } from "./utils";

interface DocumentUploaderProps {
  onUploadComplete: () => void;
}

// Taille maximale recommandée pour localStorage (environ 5 Mo)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DocumentUploader = ({ onUploadComplete }: DocumentUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  
  // Référence pour l'input de fichier
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let successCount = 0;
      let sizeErrorCount = 0;
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        
        // Vérification de la taille du fichier
        if (file.size > MAX_FILE_SIZE) {
          console.warn(`Fichier trop volumineux: ${file.name} (${formatFileSize(file.size)})`);
          sizeErrorCount++;
          setUploadProgress(Math.round((i + 1) / totalFiles * 100));
          continue;
        }
        
        // Process the document
        try {
          const success = await processDocument(file);
          if (success) {
            successCount++;
          }
        } catch (fileError) {
          console.error("Erreur lors du traitement du document:", fileError);
          // Continuer avec le fichier suivant
        }
        
        // Update progress
        setUploadProgress(Math.round((i + 1) / totalFiles * 100));
      }

      // Show appropriate message
      if (sizeErrorCount > 0) {
        toast({
          title: "Attention aux limites de taille",
          description: `${sizeErrorCount} fichier(s) n'ont pas pu être traités car ils dépassent la limite de ${formatFileSize(MAX_FILE_SIZE)}.`,
          variant: "destructive"
        });
      }
      
      if (successCount > 0) {
        toast({
          title: "Documents ajoutés",
          description: `${successCount} document(s) ont été ajoutés à la base de données locale.`,
          variant: "default"
        });
      } else if (sizeErrorCount === 0) {
        toast({
          title: "Échec de l'importation",
          description: "Aucun document n'a pu être ajouté à la base de données locale.",
          variant: "destructive"
        });
      }

      // Notify parent component
      onUploadComplete();
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast({
        title: "Erreur d'upload",
        description: "Une erreur s'est produite lors de l'ajout des documents.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Fonction pour déclencher le clic sur l'input file caché
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="p-3 rounded-full bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Ajouter des documents à la base locale</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Formats supportés: PDF, Word, TXT, CSV, JSON, MD
          </p>
        </div>
        
        <div className="w-full max-w-sm">
          <Button
            variant="outline"
            className="w-full relative"
            disabled={isUploading}
            onClick={triggerFileInput}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploadProgress}% Traitement...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Parcourir...
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md,.json,.csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
        
        {isUploading && (
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-in-out" 
              style={{width: `${uploadProgress}%`}}
            />
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm flex gap-2 items-start">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-amber-800">
            <p className="font-medium">Limitation de taille</p>
            <p className="text-xs">
              Les fichiers sont stockés dans le navigateur et limités à {formatFileSize(MAX_FILE_SIZE)} par fichier.
              Pour de meilleurs résultats, privilégiez les fichiers texte (.txt, .md).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
