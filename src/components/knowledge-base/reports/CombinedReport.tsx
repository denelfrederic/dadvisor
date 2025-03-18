
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Database, FileBox } from "lucide-react";
import { CombinedReport } from "../types";
import { generateCombinedReport } from "../services/statsService";
import { useToast } from "@/hooks/use-toast";

const CombinedReportView = () => {
  const [report, setReport] = useState<CombinedReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const data = await generateCombinedReport();
      setReport(data);
      toast({
        title: "Rapport généré",
        description: "Le rapport d'indexation combiné a été généré avec succès."
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport d'indexation.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rapport d'indexation combiné</h2>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isLoading}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse...' : 'Générer le rapport'}
        </Button>
      </div>

      {report ? (
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
              <div className="grid grid-cols-3 gap-4 mb-4">
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
              <div className="grid grid-cols-3 gap-4 mb-4">
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
                  <span>{report.knowledgeBase.count + report.documents.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sources avec embeddings</span>
                  <span>{(report.knowledgeBase.withEmbeddings || 0) + report.documents.withEmbeddings}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progression globale d'indexation</span>
                  <span>
                    {(report.knowledgeBase.count + report.documents.total) > 0 
                      ? Math.round(((report.knowledgeBase.withEmbeddings || 0) + report.documents.withEmbeddings) / (report.knowledgeBase.count + report.documents.total) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={(report.knowledgeBase.count + report.documents.total) > 0 
                    ? ((report.knowledgeBase.withEmbeddings || 0) + report.documents.withEmbeddings) / (report.knowledgeBase.count + report.documents.total) * 100
                    : 0} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-80 text-center">
          <RefreshCw className="h-12 w-12 mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">Aucun rapport disponible</h3>
          <p className="text-muted-foreground mb-4">
            Générez un rapport pour voir l'état d'indexation de vos données
          </p>
          <Button onClick={handleGenerateReport} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Générer le rapport
          </Button>
        </div>
      )}
    </div>
  );
};

export default CombinedReportView;
