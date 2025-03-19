
// Utilitaires pour la journalisation

/**
 * Journal d'activité avec niveau de sévérité
 */
export const logMessage = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'error':
      console.error(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
  
  return formattedMessage;
};

/**
 * Journal sur les dimensions d'un vecteur
 */
export const logVectorInfo = (id: string, vector: number[], metadata?: any) => {
  logMessage(`Vecteur ID: ${id}, dimensions: ${vector.length}`);
  if (metadata) {
    logMessage(`Métadonnées: ${JSON.stringify(metadata)}`);
  }
};

/**
 * Journal d'une erreur avec stack trace
 */
export const logError = (context: string, error: any) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : 'Pas de stack trace disponible';
  
  logMessage(`${context}: ${errorMessage}`, 'error');
  logMessage(`Stack trace: ${stackTrace}`, 'error');
  
  return errorMessage;
};
