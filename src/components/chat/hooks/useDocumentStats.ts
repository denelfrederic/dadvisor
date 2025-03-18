
import { useState, useEffect } from "react";

interface DocumentStats {
  count: number;
  types: Record<string, number>;
  totalSize: number;
}

/**
 * Hook for fetching and managing document statistics
 */
export const useDocumentStats = () => {
  const [stats, setStats] = useState<DocumentStats>({ count: 0, types: {}, totalSize: 0 });
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);

  useEffect(() => {
    const fetchDocStats = async () => {
      try {
        const { data, error } = await fetch('/api/documents/stats').then(res => res.json());
        if (error) throw error;
        setStats(data || { count: 0, types: {}, totalSize: 0 });
      } catch (error) {
        console.error("Error fetching document stats:", error);
      }
    };
    
    fetchDocStats();
  }, []);

  return {
    stats,
    isDocManagerOpen,
    setIsDocManagerOpen
  };
};
