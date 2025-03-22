
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TestSuggestionsProps {
  errorType?: string;
  errorMessage?: string;
}

/**
 * Composant qui affiche des suggestions pour résoudre les problèmes courants
 * lors des tests de connexion à Pinecone
 */
const TestSuggestions: React.FC<TestSuggestionsProps> = ({ 
  errorType, 
  errorMessage 
}) => {
  // Déterminer le type de suggestion à afficher
  const getErrorCategory = () => {
    if (!errorMessage && !errorType) return "general";
    
    if (errorMessage) {
      if (errorMessage.includes("Failed to send") || 
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("Edge Function")) {
        return "function";
      }
      
      if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        return "auth";
      }
      
      if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        return "notfound";
      }
      
      if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
        return "timeout";
      }
    }
    
    return "general";
  };
  
  const category = getErrorCategory();
  
  return (
    <div className="mt-4">
      <Alert variant="warning" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Suggestions de résolution</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p>Voici quelques suggestions pour résoudre ce problème :</p>
          
          <Accordion type="single" collapsible className="mt-2">
            {category === "function" && (
              <AccordionItem value="function">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Problème de connexion à la fonction Edge
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-xs mt-1">
                    <li>Vérifiez que la fonction <code>pinecone-vectorize</code> est correctement déployée dans Supabase</li>
                    <li>Assurez-vous que la fonction ne contient pas d'erreurs de syntaxe</li>
                    <li>Vérifiez qu'il n'y a pas de restrictions réseau qui bloquent les appels à la fonction</li>
                    <li>Consultez les logs de la fonction Edge dans la console Supabase</li>
                    <li>Redéployez la fonction si nécessaire</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {category === "auth" && (
              <AccordionItem value="auth">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Problème d'autorisation (403 Forbidden)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-xs mt-1">
                    <li>Vérifiez que la clé API Pinecone est correcte</li>
                    <li>Assurez-vous que la clé API a les permissions nécessaires</li>
                    <li>Si vous utilisez un plan gratuit, votre index pourrait être en pause</li>
                    <li>Allez sur la console Pinecone pour réactiver votre index</li>
                    <li>Vérifiez si vous avez atteint les limites de votre plan Pinecone</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {category === "notfound" && (
              <AccordionItem value="notfound">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    URL ou index non trouvé (404)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-xs mt-1">
                    <li>Vérifiez que l'URL Pinecone configurée est correcte</li>
                    <li>Assurez-vous que l'index spécifié existe dans votre compte Pinecone</li>
                    <li>Vérifiez l'orthographe exacte de l'index dans la configuration</li>
                    <li>Pour les API serverless, vérifiez que l'URL inclut <code>.aped-</code> ou <code>.serverless.</code></li>
                    <li>Récupérez l'URL correcte depuis la console Pinecone</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            
            {category === "timeout" && (
              <AccordionItem value="timeout">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Timeout de la requête
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-xs mt-1">
                    <li>Si vous utilisez un plan gratuit, votre index peut être en cours de démarrage</li>
                    <li>Le démarrage d'un index en pause peut prendre plusieurs minutes</li>
                    <li>Vérifiez l'état de votre index dans la console Pinecone</li>
                    <li>Réduisez la taille de votre requête ou le nombre de résultats demandés</li>
                    <li>Vérifiez si le service Pinecone connaît des perturbations</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            
            <AccordionItem value="settings">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Vérifier la configuration
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1 text-xs mt-1">
                  <li>Vérifiez que les variables d'environnement suivantes sont correctement configurées dans Supabase :</li>
                  <li><code>PINECONE_API_KEY</code> : Votre clé API Pinecone</li>
                  <li><code>PINECONE_BASE_URL</code> : L'URL de votre index Pinecone (ex: https://your-index.svc.region.pinecone.io)</li>
                  <li><code>PINECONE_INDEX</code> : Le nom de votre index Pinecone</li>
                  <li>Ces variables doivent être définies dans les secrets des fonctions Edge Supabase</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="text-xs mt-4 text-amber-700">
            <p>Pour plus d'informations, consultez la <a href="https://docs.pinecone.io/troubleshooting" target="_blank" rel="noopener noreferrer" className="underline">documentation de dépannage Pinecone</a>.</p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TestSuggestions;
