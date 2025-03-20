
import { InvestorProfileAnalysis, QuestionnaireResponses } from "./types";

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
