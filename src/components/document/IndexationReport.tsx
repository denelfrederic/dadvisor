
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, FilePlus, FileWarning, Trash2 } from "lucide-react";
import { useIndexationReport } from "./hooks/useIndexationReport";
import { formatFileSize } from "./utils";
import { useEmbeddingsUpdate } from "../knowledge-base/search/hooks/useEmbeddingsUpdate";

const IndexationReport = () => {
  const [activeTab, setActiveTab] = useState<string>("report");
  const { 
    report, 
    isLoading, 
    error, 
    logs, 
    generateReport, 
    clearLogs 
  } = useIndexationReport();
  
  const { 
    isUpdatingEmbeddings,
    updateExistingDocumentEmbeddings
  } = useEmbeddingsUpdate();

  const handleGenerateReport = () => {
    generateReport();
  };

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
    link.setAttribute('download', `rapport-indexation-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLogsToFile = () => {
    if (logs.length === 0) return;
    
    const content = logs.join("\n");
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `logs-indexation-${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rapport d'indexation des documents</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateReport} 
            disabled={isLoading}
            variant="outline" 
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyse...' : 'Générer le rapport'}
          </Button>
          
          <Button
            onClick={updateExistingDocumentEmbeddings}
            disabled={isUpdatingEmbeddings || isLoading || !report}
            variant="outline"
            size="sm"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            {isUpdatingEmbeddings ? 'Génération...' : 'Générer embeddings manquants'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="report" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="report">Rapport d'indexation</TabsTrigger>
          <TabsTrigger value="logs">Logs système</TabsTrigger>
        </TabsList>
        
        <TabsContent value="report">
          {report ? (
            <div className="space-y-4">
              {/* Statistiques générales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Documents totaux</span>
                    <span className="text-2xl font-bold">{report.totalDocuments}</span>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Avec embeddings</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{report.documentsWithEmbeddings}</span>
                      <Badge variant={report.embeddingsPercentage > 80 ? "default" : "destructive"}>
                        {report.embeddingsPercentage}%
                      </Badge>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Sans embeddings</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{report.documentsWithoutEmbeddings}</span>
                      {report.documentsWithoutEmbeddings > 0 && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Attention
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Progression d'indexation */}
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression d'indexation</span>
                    <span>{report.embeddingsPercentage}%</span>
                  </div>
                  <Progress value={report.embeddingsPercentage} className="h-2" />
                </div>
              </Card>
              
              {/* Répartition par type */}
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-2">Répartition par type</h3>
                <ScrollArea className="h-24">
                  <div className="space-y-1">
                    {Object.entries(report.documentsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span>{type || "Inconnu"}</span>
                        <span>{count} document(s)</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
              
              {/* Liste des documents récents */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Documents récents</h3>
                  {report.recentDocuments.length > 0 && (
                    <Button onClick={exportReportToCSV} variant="ghost" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Exporter CSV
                    </Button>
                  )}
                </div>
                
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 gap-2 p-2 border-b bg-muted/50 text-xs font-medium">
                    <div className="col-span-5">Titre</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Embedding</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1">Taille</div>
                  </div>
                  
                  <ScrollArea className="h-[280px]">
                    {report.recentDocuments.length > 0 ? (
                      report.recentDocuments.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="grid grid-cols-12 gap-2 p-2 border-b text-xs hover:bg-muted/20"
                        >
                          <div className="col-span-5 truncate" title={doc.title}>{doc.title}</div>
                          <div className="col-span-2">{doc.type}</div>
                          <div className="col-span-2">
                            {doc.hasEmbedding ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                Oui
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                                Non
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-2">{new Date(doc.created_at).toLocaleDateString()}</div>
                          <div className="col-span-1">{formatFileSize(doc.size)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-60 text-center p-4 text-muted-foreground">
                        <FileWarning className="h-8 w-8 mb-2 text-muted-foreground/60" />
                        <p>Aucun document trouvé</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <FileWarning className="h-12 w-12 mb-4 text-muted-foreground/60" />
              <h3 className="text-lg font-medium mb-2">Aucun rapport disponible</h3>
              <p className="text-muted-foreground mb-4">
                Générez un rapport pour voir l'état d'indexation de vos documents
              </p>
              <Button onClick={handleGenerateReport} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Générer le rapport
              </Button>
              
              {error && (
                <p className="mt-4 text-red-500 text-sm">
                  Erreur: {error}
                </p>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="logs">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Logs système</h3>
              <div className="flex gap-2">
                <Button onClick={exportLogsToFile} variant="outline" size="sm" disabled={logs.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button onClick={clearLogs} variant="outline" size="sm" disabled={logs.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[400px] border rounded-md p-2 bg-black/90 text-white font-mono">
              {logs.length > 0 ? (
                <div className="space-y-1 text-xs">
                  {logs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-center p-4 text-gray-400">
                  <p>Aucun log disponible</p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndexationReport;
