
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processDocument } from "../chat/GeminiService";

interface DocumentUploaderProps {
  onUploadComplete: () => void;
}

const DocumentUploader = ({ onUploadComplete }: DocumentUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let successCount = 0;
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        
        // Process the document
        const success = await processDocument(file);
        
        if (success) {
          successCount++;
        }
        
        // Update progress
        setUploadProgress(Math.round((i + 1) / totalFiles * 100));
      }

      // Show success message
      toast({
        title: "Documents ajoutés",
        description: `${successCount} document(s) ont été ajoutés à la base de données locale.`,
        variant: successCount > 0 ? "default" : "destructive"
      });

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
          <label htmlFor="file-upload" className="w-full">
            <Button
              variant="outline"
              className="w-full relative"
              disabled={isUploading}
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
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md,.json,.csv"
                onChange={handleFileUpload}
                className="sr-only"
                disabled={isUploading}
              />
            </Button>
          </label>
        </div>
        
        {isUploading && (
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-in-out" 
              style={{width: `${uploadProgress}%`}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;
