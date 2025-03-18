
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { CombinedReport } from "../../types";

interface HistoricalReportItemProps {
  date: string;
  report: CombinedReport;
  index: number;
}

const HistoricalReportItem = ({ date, report, index }: HistoricalReportItemProps) => {
  const formatReportDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const totalSources = report.knowledgeBase.count + report.documents.total;
  const totalWithEmbeddings = (report.knowledgeBase.withEmbeddings || 0) + report.documents.withEmbeddings;
  const globalPercentage = totalSources > 0 
    ? Math.round((totalWithEmbeddings / totalSources) * 100)
    : 0;

  return (
    <Card key={index} className="border border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Rapport du {formatReportDate(date)}
          </span>
          <span className="text-xs text-muted-foreground">
            {totalSources} sources
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <div>
            <span className="text-muted-foreground">Base de connaissances:</span>{" "}
            <span className="font-medium">{report.knowledgeBase.count}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Documents:</span>{" "}
            <span className="font-medium">{report.documents.total}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avec embeddings:</span>{" "}
            <span className="font-medium">
              {totalWithEmbeddings}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Progression:</span>{" "}
            <span className="font-medium">
              {globalPercentage}%
            </span>
          </div>
        </div>
        <Progress 
          value={globalPercentage}
          className="h-1.5 mt-1" 
        />
      </CardContent>
    </Card>
  );
};

export default HistoricalReportItem;
