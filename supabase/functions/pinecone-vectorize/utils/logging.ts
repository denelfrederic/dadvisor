
/**
 * Utilitaires de logging pour les edge functions
 */

// Niveau de log
type LogLevel = 'info' | 'warning' | 'error' | 'debug';

/**
 * Journalise un message avec un niveau et un timestamp
 * @param message Message à journaliser
 * @param level Niveau de log (info, warning, error, debug)
 * @returns Le message formaté
 */
export function logMessage(message: string, level: LogLevel = 'info'): string {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Log console avec couleurs selon le niveau
  switch (level) {
    case 'error':
      console.error(formattedMessage);
      break;
    case 'warning':
      console.warn(formattedMessage);
      break;
    case 'debug':
      console.debug(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
  
  return formattedMessage;
}

/**
 * Journalise une erreur avec détails
 * @param message Message d'erreur
 * @param error Objet d'erreur
 * @returns Le message d'erreur formaté
 */
export function logError(message: string, error: any): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;
  
  // Log de l'erreur principale
  logMessage(`${message}: ${errorMessage}`, 'error');
  
  // Log de la stack trace si disponible
  if (stackTrace) {
    console.error(`Stack trace: ${stackTrace}`);
  }
  
  // Format pour le client
  return `${message}: ${errorMessage}`;
}
