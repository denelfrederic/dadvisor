
import React from "react";
import { KnowledgeBaseStats } from "../types";
import { Database } from "lucide-react";

interface KnowledgeStatsProps {
  stats: KnowledgeBaseStats;
}

const KnowledgeStats = ({ stats }: KnowledgeStatsProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Database className="h-5 w-5" />
        Base de Connaissances
      </h2>
      <p className="text-muted-foreground">
        Gérez votre base de connaissances personnalisée
      </p>
    </div>
  );
};

export default KnowledgeStats;
