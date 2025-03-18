
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentReport from "../../document/report/DocumentReport";
import KnowledgeBaseReport from "./KnowledgeBaseReport";
import { Database, FileText } from "lucide-react";

const CombinedReportView = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Rapport d'indexation</h1>
      
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="documents" className="flex items-center gap-2 py-3">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2 py-3">
            <Database className="h-4 w-4" />
            Base de connaissances
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="mt-6">
          <DocumentReport />
        </TabsContent>
        
        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBaseReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CombinedReportView;
