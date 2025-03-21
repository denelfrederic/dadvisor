
/**
 * Fonctions d'accès aux données des portefeuilles
 */

import { Portfolio } from "@/components/PortfolioCard";
import { portfolios } from "./data";

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
