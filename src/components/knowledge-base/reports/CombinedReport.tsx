
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportHeader from "./components/ReportHeader";
import CurrentReport from "./components/CurrentReport";
import HistoricalReportsList from "./components/HistoricalReportsList";
import { useReportData } from "./hooks/useReportData";

const CombinedReportView = () => {
  const {
    report,
    previousReports,
    isLoading,
    activeTab,
    setActiveTab,
    handleGenerateReport
  } = useReportData();

  return (
    <div className="space-y-6">
      <ReportHeader 
        isLoading={isLoading}
        onGenerateReport={handleGenerateReport}
      />

      {previousReports.length > 0 && report && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="current">Rapport actuel</TabsTrigger>
            <TabsTrigger value="history">Historique ({previousReports.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history">
            <HistoricalReportsList previousReports={previousReports} />
          </TabsContent>
          
          <TabsContent value="current">
            <CurrentReport 
              report={report}
              isLoading={isLoading}
              onGenerateReport={handleGenerateReport}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {(!report || previousReports.length === 0) && (
        <CurrentReport 
          report={report}
          isLoading={isLoading}
          onGenerateReport={handleGenerateReport}
        />
      )}
    </div>
  );
};

export default CombinedReportView;
