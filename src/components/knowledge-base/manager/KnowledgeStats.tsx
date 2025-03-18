
import React from "react";
import { KnowledgeBaseStats } from "../types";
import { Database, FileCheck, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KnowledgeStatsProps {
  stats: KnowledgeBaseStats;
}

const KnowledgeStats = ({ stats }: KnowledgeStatsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-5 w-5" />
          Base de Connaissances
        </h2>
        <p className="text-muted-foreground">
          Gérez votre base de connaissances personnalisée
        </p>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Entrées totales</span>
              <span className="text-2xl font-bold">{stats.count}</span>
            </div>
          </Card>
          
          {stats.categoriesCount !== undefined && (
            <Card className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Catégories</span>
                <span className="text-2xl font-bold">{stats.categoriesCount || 0}</span>
              </div>
            </Card>
          )}
          
          {stats.withEmbeddings !== undefined && (
            <Card className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Avec embeddings</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats.withEmbeddings || 0}</span>
                  {stats.count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {Math.round((stats.withEmbeddings || 0) / stats.count * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeStats;
