
import { Question } from "../types";

/**
 * Questions concernant la tolérance au risque et les comportements face aux marchés
 */
export const riskProfileQuestions: Question[] = [
  {
    id: "risk",
    text: "Comment réagiriez-vous si vos investissements perdaient 20% de leur valeur en un mois ?",
    options: [
      {
        id: "risk-1",
        text: "Je vendrais tout immédiatement pour éviter d'autres pertes",
        value: 1
      },
      {
        id: "risk-2",
        text: "Je vendrais une partie de mes investissements",
        value: 2
      },
      {
        id: "risk-3",
        text: "Je ne ferais rien et attendrais que le marché se redresse",
        value: 3
      },
      {
        id: "risk-4",
        text: "J'achèterais davantage pour profiter des prix bas",
        value: 4
      }
    ]
  },
  {
    id: "emergency",
    text: "Disposez-vous d'une épargne de précaution (fonds d'urgence) ?",
    options: [
      {
        id: "emergency-1",
        text: "Non, je n'ai pas d'épargne de précaution",
        value: 1
      },
      {
        id: "emergency-2",
        text: "J'ai moins d'un mois de dépenses en épargne de précaution",
        value: 2
      },
      {
        id: "emergency-3",
        text: "J'ai entre 1 et 3 mois de dépenses en épargne de précaution",
        value: 3
      },
      {
        id: "emergency-4",
        text: "J'ai plus de 3 mois de dépenses en épargne de précaution",
        value: 4
      }
    ]
  }
];
