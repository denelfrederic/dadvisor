
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Database, FileBox, Clock, FileAnalytics } from "lucide-react";
import { CombinedReport } from "../types";
import { generateCombinedReport } from "../services/statsService";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CombinedReportView = () => {
  const [report, setReport] = useState<CombinedReport | null>(null);
  const [previousReports, setPreviousReports] = useState<{date: string, report: CombinedReport}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const { toast } = useToast();

  // Charger les rapports précédents depuis le localStorage au chargement
  useEffect(() => {
    const storedReports = localStorage.getItem("previousIndexationReports");
    if (storedReports) {
      try {
        setPreviousReports(JSON.parse(storedReports));
      } catch (error) {
        console.error("Erreur lors du chargement des rapports précédents:", error);
      }
    }
  }, []);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const data = await generateCombinedReport();
      
      // Sauvegarder le rapport actuel dans l'historique
      if (report) {
        const updatedReports = [
          { date: new Date().toISOString(), report: report },
          ...previousReports.slice(0, 4) // Garder seulement les 5 derniers rapports
        ];
        setPreviousReports(updatedReports);
        localStorage.setItem("previousIndexationReports", JSON.stringify(updatedReports));
      }
      
      setReport(data);
      setActiveTab("current");
      
      toast({
        title: "Rapport généré",
        description: "Le rapport d'indexation a été généré avec succès."
      });
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport d'indexation.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatReportDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileAnalytics className="h-5 w-5 text-primary" />
          Rapport d'indexation global
        </h2>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isLoading}
          className="px-4"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse en cours...' : 'Générer le rapport'}
        </Button>
      </div>

      {previousReports.length > 0 && report && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="current">Rapport actuel</TabsTrigger>
            <TabsTrigger value="history">Historique ({previousReports.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-4">
                {previousReports.map((item, index) => (
                  <Card key={index} className="border border-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Rapport du {formatReportDate(item.date)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.report.knowledgeBase.count + item.report.documents.total} sources
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div>
                          <span className="text-muted-foreground">Base de connaissances:</span>{" "}
                          <span className="font-medium">{item.report.knowledgeBase.count}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Documents:</span>{" "}
                          <span className="font-medium">{item.report.documents.total}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avec embeddings:</span>{" "}
                          <span className="font-medium">
                            {(item.report.knowledgeBase.withEmbeddings || 0) + item.report.documents.withEmbeddings}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Progression:</span>{" "}
                          <span className="font-medium">
                            {(item.report.knowledgeBase.count + item.report.documents.total) > 0 
                              ? Math.round(((item.report.knowledgeBase.withEmbeddings || 0) + item.report.documents.withEmbeddings) / (item.report.knowledgeBase.count + item.report.documents.total) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={(item.report.knowledgeBase.count + item.report.documents.total) > 0 
                          ? ((item.report.knowledgeBase.withEmbeddings || 0) + item.report.documents.withEmbeddings) / (item.report.knowledgeBase.count + item.report.documents.total) * 100
                          : 0} 
                        className="h-1.5 mt-1" 
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="current">
            {renderCurrentReport()}
          </TabsContent>
        </Tabs>
      )}
      
      {(!report || previousReports.length === 0) && renderCurrentReport()}
    </div>
  );
  
  function renderCurrentReport() {
    return report ? (
      <div className="space-y-6">
        {/* Base de Connaissances */}
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
                <p className="text-2xl font-semibold">{report.knowledgeBase.count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avec embeddings</p>
                <p className="text-2xl font-semibold">{report.knowledgeBase.withEmbeddings || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Catégories</p>
                <p className="text-2xl font-semibold">{report.knowledgeBase.categoriesCount || 0}</p>
              </div>
            </div>
            
            {report.knowledgeBase.count > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression d'indexation</span>
                  <span>
                    {report.knowledgeBase.withEmbeddings && report.knowledgeBase.count 
                      ? Math.round((report.knowledgeBase.withEmbeddings / report.knowledgeBase.count) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={report.knowledgeBase.withEmbeddings && report.knowledgeBase.count 
                    ? (report.knowledgeBase.withEmbeddings / report.knowledgeBase.count) * 100
                    : 0} 
                  className="h-2" 
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
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
                <p className="text-2xl font-semibold">{report.documents.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avec embeddings</p>
                <p className="text-2xl font-semibold">{report.documents.withEmbeddings}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sans embeddings</p>
                <p className="text-2xl font-semibold">{report.documents.withoutEmbeddings}</p>
              </div>
            </div>
            
            {report.documents.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression d'indexation</span>
                  <span>{report.documents.percentage}%</span>
                </div>
                <Progress value={report.documents.percentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résumé global */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Résumé Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sources de données totales</span>
                <span className="font-medium">{report.knowledgeBase.count + report.documents.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Sources avec embeddings</span>
                <span className="font-medium">{(report.knowledgeBase.withEmbeddings || 0) + report.documents.withEmbeddings}</span>
              </div>
              <div className="flex justify-between">
                <span>Progression globale d'indexation</span>
                <span className="font-medium">
                  {(report.knowledgeBase.count + report.documents.total) > 0 
                    ? Math.round(((report.knowledgeBase.withEmbeddings || 0) + report.documents.withEmbeddings) / (report.knowledgeBase.count + report.documents.total) * 100)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={(report.knowledgeBase.count + report.documents.total) > 0 
                  ? ((report.knowledgeBase.withEmbeddings || 0) + report.documents.withEmbeddings) / (report.knowledgeBase.count + report.documents.total) * 100
                  : 0} 
                className="h-2 mt-1" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-80 text-center">
        <RefreshCw className="h-12 w-12 mb-4 text-muted-foreground/60" />
        <h3 className="text-lg font-medium mb-2">Aucun rapport disponible</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Générez un rapport pour analyser l'état d'indexation de vos données et optimiser 
          les performances de recherche de votre assistant IA.
        </p>
        <Button onClick={handleGenerateReport} disabled={isLoading} className="px-6">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Générer le rapport
        </Button>
      </div>
    );
  }
};

export default CombinedReportView;
