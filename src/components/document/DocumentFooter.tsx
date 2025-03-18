
import React from "react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "./utils";

interface DocumentFooterProps {
  stats: {
    count: number;
    totalSize: number;
  };
  onClose: () => void;
}

const DocumentFooter = ({ stats, onClose }: DocumentFooterProps) => {
  return (
    <div className="w-full flex justify-between items-center">
      <p className="text-xs text-muted-foreground">
        {stats.count} document(s) • {formatFileSize(stats.totalSize)}
      </p>
      <Button onClick={onClose}>Fermer</Button>
    </div>
  );
};

export default DocumentFooter;
