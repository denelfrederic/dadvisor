
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  suitableFor: string[];
}

interface PortfolioCardProps {
  portfolio: Portfolio;
  isRecommended?: boolean;
  onSelect: (portfolioId: string) => void;
  isSelected?: boolean;
}

const PortfolioCard = ({ 
  portfolio, 
  isRecommended = false, 
  onSelect,
  isSelected = false
}: PortfolioCardProps) => {
  const { id, name, riskLevel, description, expectedReturn, assets, suitableFor } = portfolio;
  
  // Define colors based on risk level
  const riskColors = {
    "Faible": "bg-green-100 text-green-800",
    "Modéré": "bg-blue-100 text-blue-800",
    "Élevé": "bg-amber-100 text-amber-800"
  };
  
  return (
    <motion.div 
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected ? "border-primary border-2" : "border border-border"
      }`}
      whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {isRecommended && (
        <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-medium">
          Recommandé pour votre profil
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-medium">{name}</h3>
          <Badge variant="outline" className={riskColors[riskLevel]}>
            {riskLevel}
          </Badge>
        </div>
        
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Rendement attendu</h4>
          <p className="text-xl font-semibold">{expectedReturn}</p>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Allocation d'actifs</h4>
          <div className="flex mb-2">
            {assets.map((asset, index) => (
              <div 
                key={index}
                className="h-2 first:rounded-l-full last:rounded-r-full"
                style={{ 
                  width: `${asset.percentage}%`,
                  backgroundColor: getAssetColor(index)
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {assets.map((asset, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getAssetColor(index) }}
                />
                <span className="text-muted-foreground">
                  {asset.name} ({asset.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Adapté pour</h4>
          <ul className="text-sm text-muted-foreground">
            {suitableFor.map((item, index) => (
              <li key={index} className="flex items-center gap-2 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          onClick={() => onSelect(id)}
        >
          {isSelected ? "Sélectionné" : "Sélectionner"}
        </Button>
      </div>
    </motion.div>
  );
};

// Helper function to get colors for asset allocation visualization
const getAssetColor = (index: number): string => {
  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#14B8A6", // Teal
    "#F43F5E"  // Rose
  ];
  
  return colors[index % colors.length];
};

export default PortfolioCard;
