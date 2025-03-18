
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentReport from "../../document/report/DocumentReport";
import KnowledgeBaseReport from "./KnowledgeBaseReport";
import { Database, FileText } from "lucide-react";

const CombinedReportView = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Base de connaissances
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          <DocumentReport />
        </TabsContent>
        
        <TabsContent value="knowledge">
          <KnowledgeBaseReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CombinedReportView;
