
import React from "react";

interface DebugFooterProps {
  diagnosticInfo: any;
  connectionTest: any;
}

const DebugFooter: React.FC<DebugFooterProps> = ({ diagnosticInfo, connectionTest }) => {
  return (
    <div className="mt-4 text-xs text-muted-foreground">
      <p>Utilisez cet outil pour vérifier la configuration de connexion à Pinecone et diagnostiquer les problèmes d'indexation.</p>
      {diagnosticInfo && diagnosticInfo.valid === false && (
        <p className="text-red-500 mt-1">⚠️ La configuration actuelle est invalide. Vérifiez que la clé API Pinecone est configurée correctement.</p>
      )}
      {connectionTest && !connectionTest.success && (
        <p className="text-orange-500 mt-1">💡 Conseil: vérifiez que l'URL Pinecone et le format de requête sont corrects pour votre version de l'API Pinecone.</p>
      )}
    </div>
  );
};

export default DebugFooter;
