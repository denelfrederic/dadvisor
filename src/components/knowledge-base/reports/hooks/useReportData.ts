
import { useState, useEffect, useCallback } from "react";
import { CombinedReport } from "../../types";
import { generateCombinedReport } from "../../services/statsService";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "previousIndexationReports";

export const useReportData = () => {
  const [report, setReport] = useState<CombinedReport | null>(null);
  const [previousReports, setPreviousReports] = useState<{date: string, report: CombinedReport}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const { toast } = useToast();

  // Load previous reports from localStorage on mount
  useEffect(() => {
    try {
      const storedReports = localStorage.getItem(STORAGE_KEY);
      if (storedReports) {
        const parsedReports = JSON.parse(storedReports);
        console.log("Loaded previous reports:", parsedReports);
        setPreviousReports(parsedReports);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des rapports précédents:", error);
    }
  }, []);

  // Save reports to localStorage
  const saveReportsToStorage = useCallback((reports: {date: string, report: CombinedReport}[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      console.log("Reports saved to localStorage:", reports);
    } catch (error) {
      console.error("Error saving reports to localStorage:", error);
    }
  }, []);
  
  // Une fonction pour déterminer si deux rapports sont significativement différents
  const areReportsSignificantlyDifferent = (reportA: CombinedReport, reportB: CombinedReport): boolean => {
    // Vérifier les différences dans la base de connaissances
    if (reportA.knowledgeBase.count !== reportB.knowledgeBase.count) return true;
    if (reportA.knowledgeBase.withEmbeddings !== reportB.knowledgeBase.withEmbeddings) return true;
    
    // Vérifier les différences dans les documents
    if (reportA.documents.total !== reportB.documents.total) return true;
    if (reportA.documents.withEmbeddings !== reportB.documents.withEmbeddings) return true;
    
    return false;
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const data = await generateCombinedReport();
      console.log("Generated report:", data);
      
      // Sauvegarder le rapport actuel dans l'historique s'il existe et est différent du nouveau
      if (report) {
        // Vérifier si le nouveau rapport est significativement différent
        const isDifferent = areReportsSignificantlyDifferent(report, data);
        
        // Sauvegarder uniquement si différent du rapport actuel
        if (isDifferent) {
          const currentDate = new Date().toISOString();
          const updatedReports = [
            { date: currentDate, report: report },
            ...previousReports.slice(0, 4) // Garder seulement les 5 derniers rapports
          ];
          
          setPreviousReports(updatedReports);
          saveReportsToStorage(updatedReports);
          console.log("Updated reports history with current report");
        } else {
          console.log("New report is not significantly different from current, not saving to history");
        }
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

  return {
    report,
    previousReports,
    isLoading,
    activeTab,
    setActiveTab,
    handleGenerateReport
  };
};
