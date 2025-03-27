
import { useContext } from "react";
import { QuestionnaireContext } from "./context";

/**
 * Hook pour utiliser le contexte du questionnaire
 * @returns Le contexte du questionnaire
 */
export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error("useQuestionnaire must be used within a QuestionnaireProvider");
  }
  return context;
};
