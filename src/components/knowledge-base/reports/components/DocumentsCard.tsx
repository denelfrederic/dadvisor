
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileBox } from "lucide-react";
import { CombinedReport } from "../../types";

interface DocumentsCardProps {
  documentsStats: CombinedReport["documents"];
}

const DocumentsCard = ({ documentsStats }: DocumentsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <FileBox className="h-4 w-4" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Documents totaux</p>
            <p className="text-2xl font-semibold">{documentsStats.total}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avec embeddings</p>
            <p className="text-2xl font-semibold">{documentsStats.withEmbeddings}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sans embeddings</p>
            <p className="text-2xl font-semibold">{documentsStats.withoutEmbeddings}</p>
          </div>
        </div>
        
        {documentsStats.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression d'indexation</span>
              <span>{documentsStats.percentage}%</span>
            </div>
            <Progress value={documentsStats.percentage} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsCard;
