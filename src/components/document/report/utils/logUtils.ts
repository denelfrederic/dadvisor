
/**
 * Exports system logs to a text file
 */
export const exportLogsToFile = (logs: string[]) => {
  if (logs.length === 0) return;
  
  const content = logs.join("\n");
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `logs-indexation-${new Date().toISOString().slice(0,10)}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
