
import React from "react";
import { ChevronRight } from "lucide-react";

const CurrentParameters = () => {
  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <h2 className="text-lg font-medium mb-4">Paramètres actuels</h2>
      <p className="text-muted-foreground mb-3">
        Les paramètres de connexion à Pinecone sont configurés dans le fichier 
        <code className="bg-muted px-1 py-0.5 rounded mx-1">supabase/functions/pinecone-vectorize/index.ts</code>
      </p>
      
      <ul className="space-y-2 mb-4">
        <li className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0" />
          <span><strong>Environnement :</strong> Vérifiez la variable <code className="bg-muted px-1 py-0.5 rounded">PINECONE_ENVIRONMENT</code></span>
        </li>
        <li className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0" />
          <span><strong>Index :</strong> Vérifiez la variable <code className="bg-muted px-1 py-0.5 rounded">PINECONE_INDEX</code></span>
        </li>
        <li className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0" />
          <span><strong>URL :</strong> Générée automatiquement à partir des deux précédentes</span>
        </li>
      </ul>
      
      <div className="rounded-md bg-muted p-4 text-sm">
        <pre className="overflow-x-auto text-xs">
          {`const PINECONE_ENVIRONMENT = 'aped-4627-b74a'; // Votre environnement
const PINECONE_INDEX = 'dadvisor-3q5v9g1';   // Votre index
const PINECONE_BASE_URL = \`https://\${PINECONE_INDEX}.svc.\${PINECONE_ENVIRONMENT}.pinecone.io\`;`}
        </pre>
      </div>
    </div>
  );
};

export default CurrentParameters;
