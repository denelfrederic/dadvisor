
import React from "react";
import { Button } from "@/components/ui/button";

interface UpdateResultMessageProps {
  updateResult: { success: boolean; message: string } | null;
  onReloadDocument: () => void;
}

/**
 * Affiche le résultat d'une opération d'indexation
 */
const UpdateResultMessage: React.FC<UpdateResultMessageProps> = ({ 
  updateResult, 
  onReloadDocument 
}) => {
  if (!updateResult) return null;

  return (
    <div className={`p-3 rounded-md ${updateResult.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
      <p>{updateResult.message}</p>
      {updateResult.success && (
        <Button
          onClick={onReloadDocument}
          variant="link"
          size="sm"
          className="p-0 h-auto text-green-600 mt-2"
        >
          Cliquez ici pour rafraîchir les données du document
        </Button>
      )}
    </div>
  );
};

export default UpdateResultMessage;
