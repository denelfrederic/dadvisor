
import { useEffect } from "react";
import { QuestionnaireResponses } from "../types";

/**
 * Props pour le hook useQuestionnaireInitializer
 */
interface UseQuestionnaireInitializerProps {
  setAnswers: (answers: QuestionnaireResponses) => void;
  setScore: (score: number) => void;
  setIsComplete: (isComplete: boolean) => void;
  setShowAnalysis: (show: boolean) => void;
  setShowIntroduction: (show: boolean) => void;
  loadStoredData: () => {
    savedAnswers: QuestionnaireResponses | null;
    savedScore: number | null;
    savedComplete: boolean | null;
  };
  clearStorage: () => void;
}

/**
 * Hook personnalisé pour initialiser les données du questionnaire
 * Gère le chargement initial des données depuis le stockage local
 */
export const useQuestionnaireInitializer = ({
  setAnswers,
  setScore,
  setIsComplete,
  setShowAnalysis,
  setShowIntroduction,
  loadStoredData,
  clearStorage
}: UseQuestionnaireInitializerProps) => {
  
  // Charger les données lors du montage initial
  useEffect(() => {
    try {
      // Vérifier si on est sur la page du questionnaire (pathname contient "questionnaire")
      const isQuestionnairePage = window.location.pathname.includes("questionnaire");
      console.log("Chargement des données - Page questionnaire:", isQuestionnairePage);
      
      const { savedAnswers, savedScore, savedComplete } = loadStoredData();
      
      if (savedAnswers && Object.keys(savedAnswers).length > 0) {
        console.log("Chargement des réponses sauvegardées:", Object.keys(savedAnswers).length, "réponses");
        setAnswers(savedAnswers);
        
        // Détermine si on doit montrer l'introduction (seulement si aucune réponse)
        if (Object.keys(savedAnswers).length > 0) {
          setShowIntroduction(false);
        }
      }
      
      if (savedScore !== null) {
        console.log("Chargement du score sauvegardé:", savedScore);
        setScore(savedScore);
      }
      
      if (savedComplete !== null) {
        console.log("Chargement de l'état de complétion:", savedComplete);
        setIsComplete(savedComplete);
        
        // Si c'est la page du questionnaire, afficher l'introduction plutôt que l'analyse
        if (savedComplete && !isQuestionnairePage) {
          setShowAnalysis(true);
          setShowIntroduction(false);
        } else if (isQuestionnairePage) {
          // Sur la page questionnaire, on priorise l'affichage du questionnaire
          setShowAnalysis(false);
          setShowIntroduction(Object.keys(savedAnswers || {}).length === 0);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // En cas d'erreur, réinitialiser pour éviter un état incohérent
      clearStorage();
    }
  }, [setAnswers, setScore, setIsComplete, setShowAnalysis, setShowIntroduction, loadStoredData, clearStorage]);
};
