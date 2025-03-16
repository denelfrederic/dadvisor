
/**
 * Données et utilitaires pour le questionnaire de profilage financier
 */

import { Question } from "@/components/QuestionCard";

// Questions du questionnaire de profilage
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
  }
];

// Type pour stocker les réponses
export interface QuestionnaireResponses {
  [questionId: string]: {
    optionId: string;
    value: number;
  };
}

/**
 * Calcule le score de profil de risque basé sur les réponses au questionnaire
 * @param responses Les réponses au questionnaire
 * @returns Le score total calculé
 */
export const calculateRiskScore = (responses: QuestionnaireResponses): number => {
  let totalScore = 0;
  let answeredQuestions = 0;
  
  Object.values(responses).forEach(response => {
    totalScore += response.value;
    answeredQuestions++;
  });
  
  return Math.round((totalScore / (answeredQuestions * 4)) * 100);
};

/**
 * Détermine le profil d'investissement recommandé basé sur le score de risque
 * @param riskScore Le score de risque calculé
 * @returns L'ID du portefeuille recommandé
 */
export const getRecommendedPortfolio = (riskScore: number): string => {
  if (riskScore < 40) {
    return "conservative";
  } else if (riskScore < 70) {
    return "balanced";
  } else {
    return "growth";
  }
};

/**
 * Vérifie si l'utilisateur a répondu à toutes les questions
 * @param responses Les réponses au questionnaire
 * @returns Vrai si toutes les questions ont été répondues
 */
export const hasCompletedQuestionnaire = (responses: QuestionnaireResponses): boolean => {
  return questions.every(question => responses[question.id] !== undefined);
};

/**
 * Vérifie si le questionnaire a passé le seuil de validation (50%)
 * @param riskScore Le score de risque calculé
 * @returns Vrai si le score dépasse le seuil de validation
 */
export const hasPassedValidationThreshold = (riskScore: number): boolean => {
  return riskScore >= 50;
};

/**
 * Interface pour les caractéristiques d'un profil d'investisseur
 */
export interface InvestorProfileAnalysis {
  title: string;
  description: string;
  traits: string[];
  suitableInvestments: string[];
  risksToConsider: string[];
  timeHorizon: string;
  allocation: {
    label: string;
    value: number;
  }[];
}

/**
 * Obtient une analyse détaillée du profil d'investisseur basée sur le score de risque
 * @param riskScore Le score de risque calculé
 * @param responses Les réponses au questionnaire pour une analyse plus précise
 * @returns L'analyse détaillée du profil
 */
export const getInvestorProfileAnalysis = (
  riskScore: number, 
  responses: QuestionnaireResponses
): InvestorProfileAnalysis => {
  // Profil conservateur (score < 40)
  if (riskScore < 40) {
    return {
      title: "Profil Conservateur",
      description: "Vous êtes un investisseur prudent qui valorise la préservation du capital et la stabilité. Vous préférez limiter les risques, même si cela signifie des rendements potentiellement plus faibles. DADVISOR vous aide à comprendre ce profil, mais vous gardez le contrôle total de vos investissements.",
      traits: [
        "Prudent et méthodique dans vos décisions financières",
        "Préfère la stabilité et la sécurité plutôt que des gains potentiellement élevés",
        "Sensible aux fluctuations à court terme de vos investissements",
        "Privilégie la préservation du capital sur la croissance"
      ],
      suitableInvestments: [
        "Obligations d'État et d'entreprises de haute qualité",
        "Fonds d'épargne et certificats de dépôt",
        "Stablecoins et crypto-actifs à faible volatilité",
        "ETFs d'obligations et de dividendes"
      ],
      risksToConsider: [
        "Risque d'inflation érodant le pouvoir d'achat",
        "Rendements potentiellement insuffisants pour atteindre vos objectifs à long terme",
        "Opportunités manquées pendant les marchés haussiers"
      ],
      timeHorizon: "Court à moyen terme (1-5 ans)",
      allocation: [
        { label: "Crypto-actifs conservateurs", value: 15 },
        { label: "Stablecoins", value: 25 },
        { label: "Obligations", value: 40 },
        { label: "Actions à dividendes", value: 15 },
        { label: "Liquidités", value: 5 }
      ]
    };
  }
  // Profil équilibré (score entre 40 et 70)
  else if (riskScore < 70) {
    return {
      title: "Profil Équilibré",
      description: "Vous cherchez un équilibre entre croissance et stabilité. Vous êtes prêt à accepter une volatilité modérée pour obtenir des rendements plus élevés à long terme. DADVISOR vous aide à comprendre ce profil, mais vous gardez toujours le contrôle total de vos actifs.",
      traits: [
        "Capable de tolérer des fluctuations modérées du marché",
        "Recherche un équilibre entre croissance et sécurité",
        "Ouvert à diversifier entre différentes classes d'actifs",
        "Patient et orienté vers le moyen à long terme"
      ],
      suitableInvestments: [
        "Portefeuille diversifié d'actions et d'obligations",
        "ETFs indiciels et sectoriels",
        "Cryptomonnaies établies comme Bitcoin et Ethereum",
        "Actifs tokenisés et immobilier digital"
      ],
      risksToConsider: [
        "Exposition aux cycles économiques et aux fluctuations du marché",
        "Périodes potentielles de rendements négatifs à court terme",
        "Nécessité de rééquilibrer périodiquement le portefeuille"
      ],
      timeHorizon: "Moyen à long terme (5-10 ans)",
      allocation: [
        { label: "Cryptomonnaies établies", value: 25 },
        { label: "Actions", value: 35 },
        { label: "Obligations", value: 20 },
        { label: "Stablecoins", value: 15 },
        { label: "Actifs alternatifs", value: 5 }
      ]
    };
  }
  // Profil croissance (score >= 70)
  else {
    return {
      title: "Profil Croissance",
      description: "Vous êtes un investisseur orienté vers la croissance à long terme et prêt à accepter une volatilité significative pour maximiser vos rendements potentiels. DADVISOR vous aide à comprendre ce profil, mais vous gardez le contrôle total de vos investissements.",
      traits: [
        "Forte tolérance au risque et à la volatilité",
        "Perspective d'investissement à long terme",
        "Capacité émotionnelle à résister aux baisses de marché",
        "Intérêt pour l'innovation et les nouveaux marchés"
      ],
      suitableInvestments: [
        "Actions de croissance et technologies émergentes",
        "Cryptomonnaies diversifiées incluant des projets innovants",
        "Actifs à haut rendement potentiel",
        "Investissements dans l'innovation et les tendances émergentes"
      ],
      risksToConsider: [
        "Forte volatilité à court et moyen terme",
        "Risque de concentration dans certains secteurs",
        "Nécessité d'une surveillance plus active du portefeuille"
      ],
      timeHorizon: "Long terme (10+ ans)",
      allocation: [
        { label: "Cryptomonnaies diversifiées", value: 40 },
        { label: "Actions de croissance", value: 35 },
        { label: "Actifs tokenisés", value: 15 },
        { label: "Obligations", value: 5 },
        { label: "Stablecoins", value: 5 }
      ]
    };
  }
};

/**
 * Génère une analyse personnalisée du style d'investissement basée sur des réponses spécifiques
 * @param responses Les réponses au questionnaire
 * @returns Analyse textuelle du style d'investissement
 */
export const analyzeInvestmentStyle = (responses: QuestionnaireResponses): string[] => {
  const insights: string[] = [];
  
  // Analyse de l'horizon d'investissement
  if (responses.horizon) {
    if (responses.horizon.value === 1) {
      insights.push("Votre horizon d'investissement court suggère que vous pourriez avoir besoin d'accéder à vos fonds prochainement. DADVISOR vous recommande de privilégier la liquidité et la stabilité dans vos choix d'investissement, mais la décision finale vous appartient toujours.");
    } else if (responses.horizon.value >= 3) {
      insights.push("Votre horizon d'investissement long est idéal pour bénéficier de la croissance composée et traverser les cycles du marché. Cela vous permet d'envisager des actifs plus volatils mais potentiellement plus rentables à long terme.");
    }
  }
  
  // Analyse de la tolérance au risque
  if (responses.risk) {
    if (responses.risk.value === 4) {
      insights.push("Votre approche proactive face aux baisses de marché indique une forte résilience émotionnelle et une bonne compréhension des cycles d'investissement. Cette attitude est précieuse pour investir dans des marchés volatils comme celui des cryptomonnaies.");
    } else if (responses.risk.value === 1) {
      insights.push("Votre prudence face aux baisses de marché suggère que vous préférez protéger votre capital plutôt que de prendre des risques supplémentaires. DADVISOR peut vous aider à identifier des options d'investissement adaptées, sans jamais toucher à vos fonds.");
    }
  }
  
  // Analyse de la capacité d'investissement
  if (responses.income) {
    if (responses.income.value >= 3) {
      insights.push("Votre capacité à consacrer une part significative de vos revenus à l'investissement vous permet de constituer un portefeuille diversifié plus rapidement. Gardez à l'esprit l'importance de maintenir un fonds d'urgence accessible avant d'investir dans des actifs moins liquides.");
    }
  }
  
  // Analyse des connaissances financières
  if (responses.knowledge) {
    if (responses.knowledge.value <= 2) {
      insights.push("Votre niveau de connaissance financière actuel est un excellent point de départ. DADVISOR vous accompagne pour comprendre votre profil, mais nous vous encourageons à continuer d'apprendre sur les différentes classes d'actifs pour prendre des décisions plus éclairées, tout en gardant toujours le contrôle total de vos investissements.");
    } else {
      insights.push("Votre niveau de connaissance financière vous permet de comprendre les nuances entre différentes stratégies d'investissement. Cela vous aide à évaluer plus précisément les opportunités et les risques dans votre parcours d'investissement.");
    }
  }
  
  // Analyse des objectifs financiers
  if (responses.goal) {
    if (responses.goal.value === 1) {
      insights.push("Votre priorité de préserver le capital indique que vous préférez la sécurité avant tout. DADVISOR peut vous aider à comprendre quels portefeuilles correspondent à ce profil, tout en vous laissant la liberté totale quant à la gestion de vos fonds.");
    } else if (responses.goal.value === 4) {
      insights.push("Votre objectif de croissance maximale du capital s'aligne bien avec une stratégie d'investissement à long terme incluant des actifs à fort potentiel comme certaines cryptomonnaies et actions de croissance.");
    }
  }
  
  // Ajouter un insight général sur l'auto-conservation
  insights.push("Rappel important : DADVISOR vous aide uniquement à comprendre votre profil d'investisseur et à explorer des options adaptées. Vous gardez à tout moment le contrôle total de vos fonds et prenez vos propres décisions d'investissement. Nous ne gérons jamais vos actifs ni n'avons accès à vos portefeuilles.");
  
  return insights;
};
