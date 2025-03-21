
import { Question } from "../types";

/**
 * Questions sur la situation financière personnelle
 */
export const personalFinanceQuestions: Question[] = [
  {
    id: "income",
    text: "Quelle part de vos revenus mensuels pouvez-vous consacrer à l'investissement ?",
    options: [
      {
        id: "income-1",
        text: "Moins de 5%",
        value: 1
      },
      {
        id: "income-2",
        text: "Entre 5% et 15%",
        value: 2
      },
      {
        id: "income-3",
        text: "Entre 15% et 30%",
        value: 3
      },
      {
        id: "income-4",
        text: "Plus de 30%",
        value: 4
      }
    ]
  },
  {
    id: "knowledge",
    text: "Comment évalueriez-vous vos connaissances en matière d'investissement ?",
    options: [
      {
        id: "knowledge-1",
        text: "Novice - Je connais très peu les marchés financiers",
        value: 1
      },
      {
        id: "knowledge-2",
        text: "Débutant - Je comprends les bases",
        value: 2
      },
      {
        id: "knowledge-3",
        text: "Intermédiaire - J'ai déjà investi et je comprends les risques",
        value: 3
      },
      {
        id: "knowledge-4",
        text: "Expert - Je suis très familier avec les différents types d'investissements",
        value: 4
      }
    ]
  }
];
