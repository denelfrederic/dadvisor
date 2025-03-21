import { Question } from "./types";

/**
 * Questions du questionnaire de profilage
 */
export const questions: Question[] = [
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
  },
  {
    id: "crypto",
    text: "Quelle est votre expérience avec les cryptomonnaies ?",
    options: [
      {
        id: "crypto-1",
        text: "Je n'ai jamais investi en cryptomonnaies et je suis réticent",
        value: 1
      },
      {
        id: "crypto-2",
        text: "Je suis curieux mais n'ai jamais investi en cryptomonnaies",
        value: 2
      },
      {
        id: "crypto-3",
        text: "J'ai déjà investi en Bitcoin/Ethereum",
        value: 3
      },
      {
        id: "crypto-4",
        text: "J'investis régulièrement dans plusieurs cryptomonnaies",
        value: 4
      }
    ]
  },
  {
    id: "diversification",
    text: "Quelle importance accordez-vous à la diversification de vos investissements ?",
    options: [
      {
        id: "diversification-1",
        text: "Je préfère me concentrer sur un seul type d'investissement que je comprends bien",
        value: 1
      },
      {
        id: "diversification-2",
        text: "Je diversifie un peu, mais reste dans des classes d'actifs similaires",
        value: 2
      },
      {
        id: "diversification-3",
        text: "Je diversifie entre différentes classes d'actifs (actions, obligations, etc.)",
        value: 3
      },
      {
        id: "diversification-4",
        text: "Je recherche une diversification maximale, y compris avec des actifs alternatifs",
        value: 4
      }
    ]
  },
  {
    id: "management",
    text: "Comment préférez-vous gérer vos investissements ?",
    options: [
      {
        id: "management-1",
        text: "Je préfère déléguer entièrement la gestion à des professionnels",
        value: 1
      },
      {
        id: "management-2",
        text: "Je suis les conseils des professionnels mais garde un droit de regard",
        value: 2
      },
      {
        id: "management-3",
        text: "Je gère moi-même avec quelques conseils occasionnels",
        value: 3
      },
      {
        id: "management-4",
        text: "Je veux tout gérer moi-même et prendre toutes les décisions",
        value: 4
      }
    ]
  },
  {
    id: "sovereignty",
    text: "Votre priorité est-elle d'investir exclusivement en France et en Europe pour soutenir la souveraineté économique ?",
    options: [
      {
        id: "sovereignty-1",
        text: "Non, je préfère une allocation mondiale diversifiée",
        value: 1
      },
      {
        id: "sovereignty-2",
        text: "Je privilégie l'Europe mais sans exclusivité",
        value: 2
      },
      {
        id: "sovereignty-3",
        text: "Oui, je veux favoriser les entreprises françaises et européennes",
        value: 3
      },
      {
        id: "sovereignty-4",
        text: "Je souhaite investir exclusivement dans des entreprises contribuant à la souveraineté européenne",
        value: 4
      }
    ]
  }
];
