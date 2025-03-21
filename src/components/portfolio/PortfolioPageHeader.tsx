
import React from "react";

/**
 * En-tête de la page des portefeuilles
 * @param isWarEconomy - Indique si la recommandation est basée sur la préférence pour les investissements France/Europe
 */
interface PortfolioPageHeaderProps {
  isWarEconomy: boolean;
}

const PortfolioPageHeader: React.FC<PortfolioPageHeaderProps> = ({ isWarEconomy }) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Choisissez votre portefeuille</h1>
      
      <p className="text-muted-foreground text-center mb-10">
        {isWarEconomy 
          ? "Basé sur votre préférence pour les investissements en France et en Europe, nous vous recommandons le portefeuille Économie de Guerre."
          : "Basé sur votre profil de risque, nous vous recommandons un portefeuille adapté."}
        <br />Vous pouvez toutefois sélectionner celui qui vous convient le mieux.
      </p>
    </>
  );
};

export default PortfolioPageHeader;
