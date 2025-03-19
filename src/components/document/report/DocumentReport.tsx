
import React, { useEffect } from "react";
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

  // Générer le rapport une fois au chargement
  useEffect(() => {
    generateReport();
    // Pour le débug, permettre d'accéder au rapport dans la console
    if (typeof window !== 'undefined') {
      (window as any).__documentReport = report;
    }
  }, []);

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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">État de l'indexation des documents</h2>
        <Button 
          onClick={generateReport} 
          disabled={isLoading}
          variant="outline"
          className="px-6"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse...' : 'Actualiser le rapport'}
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
                    {report.recentDocuments.length > 0 ? (
                      report.recentDocuments.map((doc) => (
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          Aucun document trouvé
                        </TableCell>
                      </TableRow>
                    )}
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
      
      {/* Bouton de débogage pour afficher les tests manuels dans la console */}
      <div className="text-xs text-gray-400 mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            console.log("Tests manuels disponibles dans la console:");
            console.log("- Ouvrez la console et tapez: await window.testDocumentReporting.testReportGeneration()");
            console.log("- Pour vérifier le rapport UI vs base de données: await window.testDocumentReporting.verifyReportAccuracy()");
            if (typeof window !== 'undefined') {
              (window as any).testDocumentReporting = {
                testReportGeneration: async () => {
                  console.log("Génération d'un rapport de test...");
                  const { data: documents } = await supabase
                    .from('documents')
                    .select('id, title, type, embedding')
                    .order('created_at', { ascending: false });
                    
                  if (!documents) {
                    console.log("Aucun document trouvé");
                    return null;
                  }
                  
                  let withEmbedding = 0;
                  documents.forEach(doc => {
                    if (doc.embedding) withEmbedding++;
                  });
                  
                  const stats = {
                    total: documents.length,
                    withEmbedding,
                    withoutEmbedding: documents.length - withEmbedding,
                    percentage: Math.round((withEmbedding / documents.length) * 100)
                  };
                  
                  console.log("===== TEST RAPPORT =====");
                  console.log(`Total documents: ${stats.total}`);
                  console.log(`Avec embedding: ${stats.withEmbedding} (${stats.percentage}%)`);
                  console.log(`Sans embedding: ${stats.withoutEmbedding}`);
                  return stats;
                },
                verifyReportAccuracy: async () => {
                  const dbStats = await (window as any).testDocumentReporting.testReportGeneration();
                  const uiReport = (window as any).__documentReport;
                  
                  console.log("Rapport UI:", uiReport);
                  console.log("Données DB:", dbStats);
                  
                  if (!uiReport || !dbStats) {
                    console.log("Impossible de comparer: données manquantes");
                    return;
                  }
                  
                  const isAccurate = 
                    dbStats.total === uiReport.totalDocuments &&
                    dbStats.withEmbedding === uiReport.documentsWithEmbeddings &&
                    dbStats.withoutEmbedding === uiReport.documentsWithoutEmbeddings &&
                    dbStats.percentage === uiReport.embeddingsPercentage;
                  
                  console.log("Test de précision:", isAccurate ? "✅ RÉUSSI" : "❌ ÉCHOUÉ");
                  
                  if (!isAccurate) {
                    console.log("Différences détectées:");
                    if (dbStats.total !== uiReport.totalDocuments) {
                      console.log(`- Total: DB=${dbStats.total}, UI=${uiReport.totalDocuments}`);
                    }
                    if (dbStats.withEmbedding !== uiReport.documentsWithEmbeddings) {
                      console.log(`- Avec embedding: DB=${dbStats.withEmbedding}, UI=${uiReport.documentsWithEmbeddings}`);
                    }
                    if (dbStats.withoutEmbedding !== uiReport.documentsWithoutEmbeddings) {
                      console.log(`- Sans embedding: DB=${dbStats.withoutEmbedding}, UI=${uiReport.documentsWithoutEmbeddings}`);
                    }
                  }
                  
                  return { isAccurate, dbStats, uiReport };
                }
              };
            }
          }}
        >
          Activer outils de diagnostic
        </Button>
      </div>
    </div>
  );
};

export default DocumentReport;
