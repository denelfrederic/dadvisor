
import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentTypeDistributionProps {
  documentsByType: Record<string, number>;
}

const DocumentTypeDistribution = ({ documentsByType }: DocumentTypeDistributionProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-2">Répartition par type</h3>
      <ScrollArea className="h-24">
        <div className="space-y-1">
          {Object.entries(documentsByType).map(([type, count]) => (
            <div key={type} className="flex justify-between text-sm">
              <span>{type || "Inconnu"}</span>
              <span>{count} document(s)</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default DocumentTypeDistribution;
