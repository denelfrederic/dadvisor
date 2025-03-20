
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DebugInfo from "../DebugInfo";
import PineconeQueryTester from "./PineconeQueryTester";

const DebugTools = () => {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="info">Diagnostics</TabsTrigger>
          <TabsTrigger value="query">Testeur de requête</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <DebugInfo onGetInfo={() => {}} />
        </TabsContent>
        
        <TabsContent value="query">
          <PineconeQueryTester />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugTools;
