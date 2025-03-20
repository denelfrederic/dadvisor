
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useIndexationReport } from "../hooks/useIndexationReport";
import IndexationProgressPanel from "./IndexationProgressPanel";
import DocumentTable from "./DocumentTable";
import LogPanel from "./LogPanel";
import ConnectionTestTab from "./debug/ConnectionTestTab";
import TestConnectionButton from "./debug/TestConnectionButton";
import ManageTab from "../tabs/ManageTab";
import SynchronizationPanel from "./SynchronizationPanel";

export default function DocumentReport() {
  const { report, isLoading, logs, generateReport, clearLogs } = useIndexationReport();
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("status");

  const handleTestConnection = (result: any) => {
    setConnectionTest(result);
    if (result && !result.success) {
      setActiveTab("connection");
    }
  };

  const handleRefresh = async () => {
    await generateReport();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Rapport d'indexation</h2>
        <div className="flex gap-2">
          <TestConnectionButton onTestComplete={handleTestConnection} isLoading={isLoading} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Chargement..." : "Actualiser"}
          </Button>
        </div>
      </div>

      {/* Emplacement pour le panneau de synchronisation */}
      <SynchronizationPanel onComplete={handleRefresh} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="status">Statut</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="connection">Test de connexion</TabsTrigger>
          <TabsTrigger value="manage">Gestion</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {report && (
            <>
              <IndexationProgressPanel report={report} />
              <DocumentTable documents={report.recentDocuments} loading={isLoading} />
            </>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <LogPanel logs={logs} onClear={clearLogs} />
        </TabsContent>

        <TabsContent value="connection">
          <ConnectionTestTab
            connectionTest={connectionTest}
            onTestConnection={handleTestConnection}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="manage">
          {report && (
            <ManageTab
              stats={{
                count: report.totalDocuments,
                types: report.documentsByType,
                totalSize: 0, // Ajouter la taille totale si disponible
              }}
              refreshStats={generateReport}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
