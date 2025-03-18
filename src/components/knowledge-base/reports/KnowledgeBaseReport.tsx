
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import KnowledgeBaseCard from "./components/KnowledgeBaseCard";
import EmptyReportState from "./components/EmptyReportState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeBaseStats } from "../types";
import { isValidEmbedding } from "../services/embedding/embeddingUtils";

const KnowledgeBaseReport = () => {
  const [report, setReport] = useState<KnowledgeBaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    setIsLoading(true);
    try {
      // Récupérer le nombre total d'entrées
      const { count, error } = await supabase
        .from('knowledge_entries')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }
      
      // Vérifier les catégories (sources) et les embeddings
      let categories: Record<string, number> = {};
      let withEmbeddings = 0;
      
      // Récupérer toutes les entrées pour analyse
      const { data: entries, error: entriesError } = await supabase
        .from('knowledge_entries')
        .select('id, source, embedding');
      
      if (entriesError) {
        throw new Error(`Erreur lors de l'analyse des entrées: ${entriesError.message}`);
      }
      
      if (entries) {
        console.log(`Analyzing ${entries.length} knowledge entries for embeddings`);
        
        // Compter les entrées avec embeddings valides
        for (const entry of entries) {
          try {
            const hasValidEmbedding = isValidEmbedding(entry.embedding);
            if (hasValidEmbedding) {
              withEmbeddings++;
            }
            
            // Analyser les sources comme catégories
            const category = entry.source || 'Non catégorisé';
            categories[category] = (categories[category] || 0) + 1;
          } catch (e) {
            console.error(`Error checking embedding for entry ${entry.id}:`, e);
          }
        }
      }
      
      // Créer le rapport
      const newReport: KnowledgeBaseStats = { 
        count: count || 0,
        withEmbeddings: withEmbeddings,
        categories: categories,
        categoriesCount: Object.keys(categories).length
      };
      
      setReport(newReport);
      
      toast({
        title: "Rapport généré",
        description: `${count || 0} entrées analysées dans la base de connaissances`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error("Error generating knowledge base report:", message);
      
      toast({
        title: "Erreur",
        description: `Impossible de générer le rapport: ${message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rapport de la base de connaissances</h2>
        <Button 
          onClick={generateReport} 
          disabled={isLoading}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse...' : 'Générer le rapport'}
        </Button>
      </div>

      {report ? (
        <KnowledgeBaseCard knowledgeBaseStats={report} />
      ) : (
        <EmptyReportState 
          isLoading={isLoading} 
          onGenerateReport={generateReport} 
        />
      )}
    </div>
  );
};

export default KnowledgeBaseReport;
