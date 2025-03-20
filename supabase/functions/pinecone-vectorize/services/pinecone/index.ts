
/**
 * Point d'entrée principal pour les services Pinecone
 * Ce fichier exporte les fonctions des différents services spécialisés
 */

// Ré-exporter les fonctions depuis les services spécialisés
export { testPineconeConnection } from "./connection.ts";
export { getPineconeConfig } from "./config-service.ts";
export { indexDocumentInPinecone } from "./indexation.ts";

// Remarque: Ce fichier sert de façade pour les services Pinecone
// Il peut être utilisé pour exporter d'autres fonctionnalités à l'avenir
