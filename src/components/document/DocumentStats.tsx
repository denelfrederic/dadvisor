
import React from "react";
import { formatFileSize } from "./utils";

interface DocumentStatsProps {
  stats: {
    count: number;
    types: Record<string, number>;
    totalSize: number;
  };
}

const DocumentStats = ({ stats }: DocumentStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="border rounded-lg p-3 text-center">
        <p className="text-muted-foreground text-sm">Documents</p>
        <p className="text-2xl font-bold mt-1">{stats.count}</p>
      </div>
      <div className="border rounded-lg p-3 text-center">
        <p className="text-muted-foreground text-sm">Types</p>
        <p className="text-2xl font-bold mt-1">{Object.keys(stats.types).length}</p>
      </div>
      <div className="border rounded-lg p-3 text-center">
        <p className="text-muted-foreground text-sm">Taille totale</p>
        <p className="text-2xl font-bold mt-1">{formatFileSize(stats.totalSize)}</p>
      </div>
    </div>
  );
};

export default DocumentStats;
