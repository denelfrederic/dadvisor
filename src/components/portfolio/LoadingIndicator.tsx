
import React from "react";

/**
 * Indicateur de chargement pour la page des portefeuilles
 */
const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingIndicator;
