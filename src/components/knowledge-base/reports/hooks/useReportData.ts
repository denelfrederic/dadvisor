
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

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const data = await generateCombinedReport();
      console.log("Generated report:", data);
      
      // Save current report to history if it exists
      if (report) {
        const currentDate = new Date().toISOString();
        const updatedReports = [
          { date: currentDate, report: report },
          ...previousReports.slice(0, 4) // Keep only the last 5 reports
        ];
        
        setPreviousReports(updatedReports);
        saveReportsToStorage(updatedReports);
        console.log("Updated reports history with current report");
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
