
/**
 * Données et utilitaires pour les portefeuilles d'investissement
 */

import { Portfolio } from "@/components/PortfolioCard";

// Descriptions des portefeuilles disponibles
export const portfolios: Portfolio[] = [
  {
    id: "conservative",
    name: "Portefeuille Prudent",
    riskLevel: "Faible",
    description: "Une approche conservatrice axée sur la préservation du capital avec une volatilité minimale.",
    expectedReturn: "3% - 5% par an",
    assets: [
      { name: "Obligations", percentage: 60 },
      { name: "Actions", percentage: 20 },
      { name: "Immobilier", percentage: 10 },
      { name: "Liquidités", percentage: 10 }
    ],
    suitableFor: [
      "Investisseurs avec un horizon à court terme",
      "Personnes proches de la retraite",
      "Investisseurs avec une faible tolérance au risque",
      "Préservation du capital comme objectif principal"
    ]
  },
  {
    id: "balanced",
    name: "Portefeuille Équilibré",
    riskLevel: "Modéré",
    description: "Un équilibre entre croissance et stabilité, offrant un compromis risque-rendement attractif.",
    expectedReturn: "5% - 8% par an",
    assets: [
      { name: "Actions", percentage: 50 },
      { name: "Obligations", percentage: 30 },
      { name: "Immobilier", percentage: 15 },
      { name: "Liquidités", percentage: 5 }
    ],
    suitableFor: [
      "Investisseurs avec un horizon à moyen terme",
      "Personnes cherchant un équilibre risque-rendement",
      "Investisseurs avec une tolérance modérée au risque",
      "Diversification et croissance comme objectifs"
    ]
  },
  {
    id: "growth",
    name: "Portefeuille Croissance",
    riskLevel: "Élevé",
    description: "Une approche dynamique visant une croissance significative du capital sur le long terme.",
    expectedReturn: "8% - 12% par an",
    assets: [
      { name: "Actions", percentage: 75 },
      { name: "Obligations", percentage: 10 },
      { name: "Cryptomonnaies", percentage: 10 },
      { name: "Liquidités", percentage: 5 }
    ],
    suitableFor: [
      "Investisseurs avec un horizon à long terme",
      "Personnes jeunes loin de la retraite",
      "Investisseurs avec une forte tolérance au risque",
      "Croissance maximale du capital comme objectif"
    ]
  }
];

/**
 * Retourne tous les portefeuilles disponibles
 * @returns La liste des portefeuilles
 */
export const getPortfolios = (): Portfolio[] => {
  return portfolios;
};

/**
 * Trouve un portefeuille par son ID
 * @param portfolioId L'ID du portefeuille à rechercher
 * @returns Le portefeuille correspondant ou undefined si non trouvé
 */
export const getPortfolioById = (portfolioId: string): Portfolio | undefined => {
  return portfolios.find(portfolio => portfolio.id === portfolioId);
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
 * Vérifie si un portefeuille sélectionné est plus risqué que le portefeuille recommandé
 * @param selectedId L'ID du portefeuille sélectionné
 * @param recommendedId L'ID du portefeuille recommandé
 * @returns Vrai si le portefeuille sélectionné est plus risqué
 */
export const isPortfolioMoreRisky = (selectedId: string, recommendedId: string): boolean => {
  const riskLevels: Record<string, number> = {
    "conservative": 1,
    "balanced": 2,
    "growth": 3
  };
  
  return riskLevels[selectedId] > riskLevels[recommendedId];
};
