
/**
 * Utilitaire de journalisation pour les opérations d'embedding
 */

export type LogEntry = string;

export const createEmbeddingLogger = () => {
  const logs: LogEntry[] = [];
  
  const addLog = (message: string) => {
    console.log(message);
    logs.push(message);
    return logs;
  };
  
  return {
    logs,
    addLog
  };
};
