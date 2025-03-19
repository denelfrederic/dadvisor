
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Bot, Database, AlertTriangle, Archive } from "lucide-react";
import { IndexationReport } from "../hooks/useIndexationReport";

interface ReportStatsCardsProps {
  report: IndexationReport;
}

const ReportStatsCards: React.FC<ReportStatsCardsProps> = ({ report }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Archive className="h-4 w-4 mr-2" />
            Documents totaux
          </CardTitle>
          <CardDescription>Base documentaire</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{report.totalDocuments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Documents stockés dans la base
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            Embeddings OpenAI
          </CardTitle>
          <CardDescription>Vectorisation locale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {report.documentsWithEmbeddings}/{report.totalDocuments}
            <span className="text-sm font-normal ml-2 text-muted-foreground">
              {report.embeddingsPercentage}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Documents avec embeddings stockés dans Supabase
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Index Pinecone
          </CardTitle>
          <CardDescription>Vectorisation distante</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {report.pineconeIndexedCount}/{report.totalDocuments}
            <span className="text-sm font-normal ml-2 text-muted-foreground">
              {report.pineconePercentage}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Documents indexés dans la base vectorielle Pinecone
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportStatsCards;
