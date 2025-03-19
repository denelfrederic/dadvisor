
import React from "react";
import PineconeConfigTester from "@/components/knowledge-base/admin/PineconeConfigTester";

interface ConfigDiagnosticProps {
  isLoading: boolean;
}

const ConfigDiagnostic = ({ isLoading }: ConfigDiagnosticProps) => {
  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <h2 className="text-lg font-medium mb-4">Diagnostic de la configuration</h2>
      <p className="text-muted-foreground mb-6">
        Cet outil vous permet de vérifier que votre configuration Pinecone est correcte et 
        de diagnostiquer les problèmes de connexion.
      </p>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <PineconeConfigTester />
      )}
    </div>
  );
};

export default ConfigDiagnostic;
