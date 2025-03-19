
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DownloadCloud, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIndexationReport } from "../hooks/useIndexationReport";
import DocumentTypeDistribution from "./DocumentTypeDistribution";
import IndexationProgressBar from "./IndexationProgressBar";
import ReportStatsCards from "./ReportStatsCards";
import EmptyReportState from "./EmptyReportState";
import { formatFileSize } from "../utils";

const DocumentReport = () => {
  const { report, isLoading, error, generateReport } = useIndexationReport();

  const exportReportToCSV = () => {
    if (!report) return;
    
    const headers = "Titre,Type,Statut Embedding,Date,Taille\n";
    const csvContent = report.recentDocuments.map(doc => {
      return `"${doc.title.replace(/"/g, '""')}","${doc.type}","${doc.hasEmbedding ? 'Oui' : 'Non'}","${new Date(doc.created_at).toLocaleString()}","${formatFileSize(doc.size)}"`;
    }).join("\n");
    
    const csv = headers + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport-indexation-documents-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={generateReport} 
          disabled={isLoading}
          className="px-6"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse en cours...' : 'Générer le rapport'}
        </Button>
      </div>

      {report ? (
        <div className="space-y-6">
          <ReportStatsCards report={report} />
          <IndexationProgressBar percentage={report.embeddingsPercentage} />
          <DocumentTypeDistribution documentsByType={report.documentsByType} />

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium">Documents récents</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportReportToCSV}
                  disabled={report.recentDocuments.length === 0}
                >
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>
              
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Embedding</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Taille</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.recentDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>
                          {doc.hasEmbedding ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Oui</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">Non</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(doc.created_at).toLocaleString()}</TableCell>
                        <TableCell>{formatFileSize(doc.size)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyReportState 
          onGenerateReport={generateReport}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
};

export default DocumentReport;
