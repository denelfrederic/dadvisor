
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

/**
 * Interface pour un portefeuille d'investissement
 */
export interface Portfolio {
  id: string;
  name: string;
  riskLevel: "Faible" | "Modéré" | "Élevé";
  description: string;
  expectedReturn: string;
  assets: {
    name: string;
    percentage: number;
  }[];
  assetDetails?: {
    category: string;
    description: string;
    examples: string[];
  }[];
  suitableFor: string[];
  thesis?: string;
}

/**
 * Interface pour les propriétés du composant PortfolioCard
 */
interface PortfolioCardProps {
  portfolio: Portfolio;
  isRecommended?: boolean;
  onSelect: (portfolioId: string) => void;
  isSelected?: boolean;
  onViewDetails?: (portfolioId: string) => void;
}

/**
 * Composant PortfolioCard - Carte présentant un portefeuille d'investissement
 * Version compacte pour afficher plus de portefeuilles
 */
const PortfolioCard = ({ 
  portfolio, 
  isRecommended = false, 
  onSelect,
  isSelected = false,
  onViewDetails
}: PortfolioCardProps) => {
  const { id, name, riskLevel, description, expectedReturn, assets } = portfolio;
  
  // Définition des couleurs en fonction du niveau de risque
  const riskColors = {
    "Faible": "bg-green-100 text-green-800",
    "Modéré": "bg-blue-100 text-blue-800",
    "Élevé": "bg-amber-100 text-amber-800"
  };
  
  return (
    <motion.div 
      className={`glass-card rounded-lg overflow-hidden transition-all duration-300 ${
        isSelected ? "border-primary border-2" : "border border-border"
      }`}
      whileHover={{ y: -3, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Bandeau "Recommandé" si applicable - version plus compacte */}
      {isRecommended && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
          Recommandé
        </div>
      )}
      
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium">{name}</h3>
          <Badge variant="outline" className={`text-xs ${riskColors[riskLevel]}`}>
            {riskLevel}
          </Badge>
        </div>
        
        {/* Description courte avec ellipsis */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>
        
        {/* Section rendement attendu - format plus compact */}
        <div className="mb-3">
          <h4 className="text-xs font-medium mb-1">Rendement</h4>
          <p className="text-sm font-semibold">{expectedReturn}</p>
        </div>
        
        {/* Section allocation d'actifs avec visualisation graphique */}
        <div className="mb-3">
          <h4 className="text-xs font-medium mb-1">Allocation</h4>
          <div className="flex mb-1 h-1.5">
            {assets.map((asset, index) => (
              <div 
                key={index}
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{ 
                  width: `${asset.percentage}%`,
                  backgroundColor: getAssetColor(index)
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {assets.slice(0, 4).map((asset, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getAssetColor(index) }}
                />
                <span className="text-muted-foreground truncate">
                  {asset.name} ({asset.percentage}%)
                </span>
              </div>
            ))}
            {assets.length > 4 && (
              <div className="text-xs text-muted-foreground">+{assets.length - 4} autres</div>
            )}
          </div>
        </div>
        
        {/* Section boutons - version plus compacte */}
        <div className="flex gap-2 mt-2">
          <Button 
            className="text-xs h-8 px-2 flex-1"
            variant="outline"
            size="sm"
            onClick={() => onViewDetails && onViewDetails(id)}
          >
            <Info size={14} className="mr-1" />
            Détails
          </Button>
          
          <Button 
            className="text-xs h-8 px-2 flex-1"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(id)}
          >
            {isSelected ? "Sélectionné" : "Sélectionner"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Fonction utilitaire pour obtenir une couleur pour la visualisation de l'allocation d'actifs
 */
const getAssetColor = (index: number): string => {
  const colors = [
    "#3B82F6", // Bleu
    "#10B981", // Vert
    "#F59E0B", // Ambre
    "#6366F1", // Indigo
    "#EC4899", // Rose
    "#8B5CF6", // Violet
    "#14B8A6", // Turquoise
    "#F43F5E"  // Rouge rosé
  ];
  
  return colors[index % colors.length];
};

export default PortfolioCard;
