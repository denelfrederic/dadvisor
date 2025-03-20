
/**
 * Gestionnaire pour la mise à jour de la configuration Pinecone
 */

import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";

/**
 * Gestionnaire pour l'action de mise à jour de configuration
 * @param requestData Données de la requête
 */
export async function handleUpdateConfigAction(requestData: any) {
  try {
    logMessage("Mise à jour de la configuration", 'info');
    
    // Vérifier que les données de configuration sont présentes
    if (!requestData.config) {
      return corsedResponse({
        success: false,
        message: "Les données de configuration sont requises"
      }, 400);
    }
    
    const configToUpdate = requestData.config;
    const updatedKeys: string[] = [];
    
    // Mise à jour de chaque clé de configuration
    for (const [key, value] of Object.entries(configToUpdate)) {
      if (typeof value === 'string') {
        logMessage(`Mise à jour de ${key}`, 'info');
        
        // Vérification de la validité de la valeur selon le type de clé
        if (key === 'PINECONE_BASE_URL') {
          // Validation de l'URL Pinecone
          if (!validatePineconeUrl(value as string)) {
            return corsedResponse({
              success: false,
              message: `URL Pinecone invalide: ${value}`,
              key
            }, 400);
          }
        }
        
        // Mettre à jour la variable d'environnement
        // Note: Dans le cadre de l'edge function, cela définit la variable pour cette exécution uniquement
        // Pour une persistance réelle, il faudrait utiliser le mécanisme de secrets de la plateforme
        try {
          Deno.env.set(key, value as string);
          updatedKeys.push(key);
        } catch (error) {
          logError(`Erreur lors de la mise à jour de ${key}`, error);
          return corsedResponse({
            success: false,
            message: `Erreur lors de la mise à jour de ${key}: ${error instanceof Error ? error.message : String(error)}`,
            key
          }, 500);
        }
      }
    }
    
    // Vérifier si des clés ont été mises à jour
    if (updatedKeys.length === 0) {
      return corsedResponse({
        success: false,
        message: "Aucune clé de configuration valide n'a été fournie"
      }, 400);
    }
    
    // Retourner le résultat de la mise à jour
    return corsedResponse({
      success: true,
      message: `Configuration mise à jour: ${updatedKeys.join(', ')}`,
      updatedKeys
    });
  } catch (error) {
    const errorMsg = logError("Erreur lors de la mise à jour de la configuration", error);
    return corsedResponse({
      success: false,
      error: errorMsg
    }, 500);
  }
}

/**
 * Valide une URL Pinecone
 * @param url URL à valider
 * @returns true si l'URL est valide, false sinon
 */
function validatePineconeUrl(url: string): boolean {
  if (!url) return false;
  
  // Vérifier le format de base de l'URL
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  
  // Vérifier que l'URL contient pinecone.io
  if (!url.includes('pinecone.io')) {
    return false;
  }
  
  return true;
}
