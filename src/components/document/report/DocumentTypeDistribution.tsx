
import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentTypeDistributionProps {
  documentsByType: Record<string, number>;
}

const DocumentTypeDistribution = ({ documentsByType }: DocumentTypeDistributionProps) => {
  return (
    <Card className="p-6">
      <h3 className="font-medium mb-4">Répartition par type</h3>
      <ScrollArea className="h-32">
        <div className="space-y-3">
          {Object.entries(documentsByType).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center">
              <span>{type || "Inconnu"}</span>
              <span className="font-medium">{count} document(s)</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default DocumentTypeDistribution;
