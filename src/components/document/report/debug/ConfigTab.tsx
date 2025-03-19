
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConfigTabProps {
  diagnosticInfo: any;
  pineconeStatus: 'idle' | 'loading' | 'success' | 'error';
}

const ConfigTab: React.FC<ConfigTabProps> = ({ diagnosticInfo, pineconeStatus }) => {
  return (
    diagnosticInfo ? (
      <ScrollArea className="h-[200px] border rounded-md p-2 bg-black/90 text-white font-mono">
        <div className="space-y-1 text-xs">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(diagnosticInfo, null, 2)}
          </pre>
        </div>
      </ScrollArea>
    ) : (
      <div className="flex flex-col items-center justify-center h-20 text-center p-4 text-gray-400 border rounded-md">
        <p className="text-sm">Cliquez sur "Vérifier config" pour diagnostiquer la configuration Pinecone</p>
      </div>
    )
  );
};

export default ConfigTab;
