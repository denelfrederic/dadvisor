
import { createContext } from "react";
import { QuestionnaireContextType } from "./types";

/**
 * Contexte du questionnaire
 * Contient toutes les données et fonctions pour gérer le questionnaire
 */
export const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);
