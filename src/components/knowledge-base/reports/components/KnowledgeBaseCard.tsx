
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database } from "lucide-react";
import { KnowledgeBaseStats } from "../../types";

interface KnowledgeBaseCardProps {
  knowledgeBaseStats: KnowledgeBaseStats;
}

const KnowledgeBaseCard = ({ knowledgeBaseStats }: KnowledgeBaseCardProps) => {
  const progressPercentage = knowledgeBaseStats.withEmbeddings && knowledgeBaseStats.count 
    ? (knowledgeBaseStats.withEmbeddings / knowledgeBaseStats.count) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Database className="h-4 w-4" />
          Base de Connaissances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Entrées totales</p>
            <p className="text-2xl font-semibold">{knowledgeBaseStats.count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avec embeddings</p>
            <p className="text-2xl font-semibold">{knowledgeBaseStats.withEmbeddings || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Catégories</p>
            <p className="text-2xl font-semibold">{knowledgeBaseStats.categoriesCount || 0}</p>
          </div>
        </div>
        
        {knowledgeBaseStats.count > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression d'indexation</span>
              <span>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress 
              value={progressPercentage}
              className="h-2" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeBaseCard;
