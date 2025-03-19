
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
  const [edgeFunctionError, setEdgeFunctionError] = useState<string | null>(null);

  // Vérifier l'état de la configuration OpenAI
  const checkOpenAIConfig = async () => {
    setIsChecking(true);
    setOpenaiStatus(null);
    setEdgeFunctionError(null);
    
    try {
      addLog("Vérification de la configuration OpenAI...");
      
      // Ajouter un timestamp pour éviter la mise en cache
      const timestamp = new Date().getTime();
      
      addLog(`Appel de la fonction edge avec timestamp ${timestamp}...`);
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'check-openai',
          _timestamp: timestamp // Éviter la mise en cache
        }
      }).catch(e => {
        console.error("Exception lors de l'appel de la fonction edge:", e);
        addLog(`ERREUR D'APPEL: ${e instanceof Error ? e.message : String(e)}`);
        throw new Error(`Échec de l'envoi de la requête à la fonction Edge: ${e.message || "Erreur inconnue"}`);
      });
      
      if (error) {
        console.error("Erreur lors de la vérification OpenAI:", error);
        addLog(`ERREUR: ${error.message}`);
        
        if (error.message.includes("Failed to send")) {
          setEdgeFunctionError(error.message);
        }
        
        setOpenaiStatus({ success: false, error: error.message });
        return;
      }
      
      addLog(`Réponse reçue: ${JSON.stringify(data)}`);
      setOpenaiStatus(data);
      
    } catch (error) {
      console.error("Exception lors de la vérification OpenAI:", error);
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      
      // Détecter l'erreur spécifique de fonction edge
      if (error instanceof Error && error.message.includes("Failed to send")) {
        setEdgeFunctionError(error.message);
      }
      
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
    setEdgeFunctionError(null);
    
    try {
      addLog(`Génération d'un embedding pour le texte: "${testText.substring(0, 50)}..."`);
      
      // Ajouter un timestamp pour éviter la mise en cache
      const timestamp = new Date().getTime();
      
      addLog(`Appel de la fonction edge avec timestamp ${timestamp}...`);
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'generate-embedding',
          text: testText,
          _timestamp: timestamp // Éviter la mise en cache
        }
      }).catch(e => {
        console.error("Exception lors de l'appel de la fonction edge:", e);
        addLog(`ERREUR D'APPEL: ${e instanceof Error ? e.message : String(e)}`);
        throw new Error(`Échec de l'envoi de la requête à la fonction Edge: ${e.message || "Erreur inconnue"}`);
      });
      
      if (error) {
        console.error("Erreur lors de la génération d'embedding:", error);
        addLog(`ERREUR: ${error.message}`);
        
        if (error.message.includes("Failed to send")) {
          setEdgeFunctionError(error.message);
        }
        
        setTestResult({ success: false, error: error.message });
        return;
      }
      
      if (!data) {
        addLog(`ERREUR: Pas de données reçues du serveur`);
        setTestResult({ success: false, error: "Pas de données reçues du serveur" });
        return;
      }
      
      addLog(`Embedding généré avec succès (${data.dimensions || "?"} dimensions)`);
      setTestResult(data);
      
    } catch (error) {
      console.error("Exception lors de la génération d'embedding:", error);
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      
      // Détecter l'erreur spécifique de fonction edge
      if (error instanceof Error && error.message.includes("Failed to send")) {
        setEdgeFunctionError(error.message);
      }
      
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
    edgeFunctionError,
    checkOpenAIConfig,
    generateTestEmbedding
  };
};
