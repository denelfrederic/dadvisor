
import React from "react";
import { ChevronRight, AlertTriangle } from "lucide-react";

const PineconePrerequisites = () => {
  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <h2 className="text-lg font-medium mb-4">Prérequis pour Pinecone</h2>
      <ul className="space-y-3">
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
          <div>
            <strong>1. Créer votre compte Pinecone</strong>
            <p className="text-sm text-muted-foreground">
              Créez un compte sur <a href="https://www.pinecone.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pinecone.io</a>
            </p>
          </div>
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
          <div>
            <strong>2. Obtenir votre clé API</strong>
            <p className="text-sm text-muted-foreground">
              Dans le tableau de bord Pinecone, allez dans les paramètres API Keys et copiez votre clé API
            </p>
          </div>
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
          <div>
            <strong>3. Configurer les secrets dans Supabase</strong>
            <p className="text-sm text-muted-foreground">
              Dans la console Supabase, allez dans les paramètres des Edge Functions et ajoutez 
              la clé <code className="bg-muted px-1 py-0.5 rounded">PINECONE_API_KEY</code> avec 
              votre valeur de clé API
            </p>
          </div>
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
          <div>
            <strong>4. Configurer la clé OpenAI</strong>
            <p className="text-sm text-muted-foreground">
              Ajoutez également la clé <code className="bg-muted px-1 py-0.5 rounded">OPENAI_API_KEY</code> dans 
              les secrets Supabase, nécessaire pour générer les embeddings
            </p>
          </div>
        </li>
      </ul>
      
      <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <p className="font-medium">Attention</p>
            <p className="text-sm mt-1">
              Les clés API manquantes ou incorrectes sont la principale cause des problèmes de connexion 
              à Pinecone. Assurez-vous de configurer correctement vos clés dans les secrets Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PineconePrerequisites;
