
import { Question } from "../types";

/**
 * Questions relatives aux fondamentaux d'investissement (horizon, risque, objectifs)
 */
export const investmentBasicsQuestions: Question[] = [
  {
    id: "horizon",
    text: "Quel est votre horizon d'investissement ?",
    options: [
      {
        id: "horizon-1",
        text: "Moins de 2 ans",
        value: 1
      },
      {
        id: "horizon-2",
        text: "2 à 5 ans",
        value: 2
      },
      {
        id: "horizon-3",
        text: "5 à 10 ans",
        value: 3
      },
      {
        id: "horizon-4",
        text: "Plus de 10 ans",
        value: 4
      }
    ]
  },
  {
    id: "goal",
    text: "Quel est votre principal objectif d'investissement ?",
    options: [
      {
        id: "goal-1",
        text: "Préserver mon capital avec un risque minimal",
        value: 1
      },
      {
        id: "goal-2",
        text: "Générer un revenu régulier",
        value: 2
      },
      {
        id: "goal-3",
        text: "Croissance équilibrée entre revenu et appréciation du capital",
        value: 3
      },
      {
        id: "goal-4",
        text: "Croissance maximale du capital, prêt à accepter des fluctuations importantes",
        value: 4
      }
    ]
  }
];
