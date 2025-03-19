
import React from "react";

interface ProgressSectionProps {
  progress: number;
}

/**
 * Affiche une barre de progression pour l'indexation des documents
 */
const ProgressSection: React.FC<ProgressSectionProps> = ({ progress }) => {
  if (progress <= 0 || progress >= 100) return null;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 my-4">
      <div 
        className="bg-primary h-2.5 rounded-full" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressSection;
