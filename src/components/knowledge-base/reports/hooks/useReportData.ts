
import { useState, useEffect } from "react";
import { CombinedReport } from "../../types";
import { generateCombinedReport } from "../../services/statsService";
import { useToast } from "@/hooks/use-toast";

export const useReportData = () => {
  const [report, setReport] = useState<CombinedReport | null>(null);
  const [previousReports, setPreviousReports] = useState<{date: string, report: CombinedReport}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const { toast } = useToast();

  // Load previous reports from localStorage on mount
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
      
      // Save current report to history
      if (report) {
        const updatedReports = [
          { date: new Date().toISOString(), report: report },
          ...previousReports.slice(0, 4) // Keep only the last 5 reports
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

  return {
    report,
    previousReports,
    isLoading,
    activeTab,
    setActiveTab,
    handleGenerateReport
  };
};
