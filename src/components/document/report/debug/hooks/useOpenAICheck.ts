
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook pour vérifier la configuration OpenAI et générer des embeddings de test
 * @param addLog Fonction pour ajouter des logs
 */
export const useOpenAICheck = (addLog: (message: string) => void) => {
  const [openaiStatus, setOpenaiStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [testText, setTestText] = useState("Ceci est un test pour générer un embedding avec OpenAI");
  const [testResult, setTestResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Vérifier l'état de la configuration OpenAI
  const checkOpenAIConfig = async () => {
    setIsChecking(true);
    setOpenaiStatus(null);
    
    try {
      addLog("Vérification de la configuration OpenAI...");
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'check-openai' }
      });
      
      if (error) {
        addLog(`ERREUR: ${error.message}`);
        setOpenaiStatus({ success: false, error: error.message });
        return;
      }
      
      addLog(`Réponse reçue: ${JSON.stringify(data)}`);
      setOpenaiStatus(data);
      
    } catch (error) {
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      setOpenaiStatus({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Générer un embedding de test
  const generateTestEmbedding = async () => {
    if (!testText.trim()) return;
    
    setIsGenerating(true);
    setTestResult(null);
    
    try {
      addLog(`Génération d'un embedding pour le texte: "${testText.substring(0, 50)}..."`);
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'generate-embedding',
          text: testText
        }
      });
      
      if (error) {
        addLog(`ERREUR: ${error.message}`);
        setTestResult({ success: false, error: error.message });
        return;
      }
      
      addLog(`Embedding généré avec succès (${data.dimensions} dimensions)`);
      setTestResult(data);
      
    } catch (error) {
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    openaiStatus,
    isChecking,
    testText,
    setTestText,
    testResult,
    isGenerating,
    checkOpenAIConfig,
    generateTestEmbedding
  };
};
