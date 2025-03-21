
import React from "react";
import { motion } from "framer-motion";
import PortfolioCard, { Portfolio } from "@/components/PortfolioCard";

/**
 * Interface pour les propriétés du composant PortfolioGrid
 */
interface PortfolioGridProps {
  portfolios: Portfolio[];
  recommendedPortfolioId: string | null;
  selectedPortfolioId: string | null;
  onSelectPortfolio: (portfolioId: string) => void;
  onViewDetails: (portfolioId: string) => void;
}

/**
 * Composant affichant la grille des portefeuilles disponibles
 */
const PortfolioGrid: React.FC<PortfolioGridProps> = ({
  portfolios,
  recommendedPortfolioId,
  selectedPortfolioId,
  onSelectPortfolio,
  onViewDetails
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {portfolios.map((portfolio) => (
        <PortfolioCard
          key={portfolio.id}
          portfolio={portfolio}
          isRecommended={portfolio.id === recommendedPortfolioId}
          onSelect={onSelectPortfolio}
          isSelected={selectedPortfolioId === portfolio.id}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default PortfolioGrid;
