
/**
 * Formats a file size in bytes to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Gets a file icon based on MIME type or extension
 */
export const getFileIcon = (filename: string, mimetype?: string): string => {
  // Simple function to determine icon based on file type
  // In a real app, you'd have more specific icons
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (mimetype?.includes('pdf') || extension === 'pdf') {
    return 'pdf';
  } else if (mimetype?.includes('word') || extension === 'docx' || extension === 'doc') {
    return 'word';
  } else if (mimetype?.includes('text') || extension === 'txt') {
    return 'text';
  } else if (extension === 'md' || extension === 'markdown') {
    return 'markdown';
  } else if (extension === 'json' || extension === 'csv') {
    return 'data';
  } else {
    return 'document';
  }
};
