
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Portfolio } from "@/components/PortfolioCard";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Interface pour les propriétés du composant PortfolioDetailsDialog
 */
interface PortfolioDetailsDialogProps {
  portfolio: Portfolio | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Composant PortfolioDetailsDialog - Affiche les détails complets d'un portefeuille dans une boîte de dialogue
 * Optimisé pour une meilleure présentation des informations
 */
const PortfolioDetailsDialog = ({ portfolio, isOpen, onClose }: PortfolioDetailsDialogProps) => {
  if (!portfolio) return null;
  
  // Fonction pour obtenir une description de la thèse d'investissement du portefeuille
  const getInvestmentThesis = (portfolio: Portfolio) => {
    if (portfolio.thesis) return portfolio.thesis;
    
    const thesisMap = {
      "Faible": "Préserver le capital tout en générant des revenus stables. Ce portefeuille vise à minimiser les fluctuations et à offrir une protection contre l'inflation.",
      "Modéré": "Équilibrer croissance et protection du capital. Ce portefeuille cherche à capturer les opportunités de marché tout en limitant la volatilité.",
      "Élevé": "Maximiser la croissance du capital à long terme. Ce portefeuille accepte une volatilité importante pour viser des rendements supérieurs."
    };
    
    return thesisMap[portfolio.riskLevel];
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>{portfolio.name}</DialogTitle>
          <DialogDescription className="text-xs">
            Niveau de risque : <span className="font-medium">{portfolio.riskLevel}</span> | 
            Rendement attendu : <span className="font-medium">{portfolio.expectedReturn}</span>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-8rem)]">
          <div className="px-4 py-2 space-y-4">
            {/* Thèse d'investissement */}
            <div>
              <h3 className="text-sm font-semibold mb-1">Thèse d'investissement</h3>
              <p className="text-xs text-muted-foreground">{getInvestmentThesis(portfolio)}</p>
            </div>
            
            {/* Description détaillée */}
            <div>
              <h3 className="text-sm font-semibold mb-1">Description</h3>
              <p className="text-xs text-muted-foreground">{portfolio.description}</p>
            </div>
            
            {/* Tableau détaillé de l'allocation */}
            <div>
              <h3 className="text-sm font-semibold mb-1">Répartition détaillée</h3>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead>Actif</TableHead>
                    <TableHead className="text-right">Pourcentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.assets.map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-1">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: getAssetColor(index) }}
                          />
                          {asset.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-1">{asset.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Détails des classes d'actifs */}
            {portfolio.assetDetails && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Classes d'actifs détaillées</h3>
                <div className="space-y-2">
                  {portfolio.assetDetails.map((assetDetail, index) => (
                    <Card key={index} className="p-3">
                      <h4 className="text-xs font-medium mb-1">{assetDetail.category}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{assetDetail.description}</p>
                      <div>
                        <h5 className="text-xs font-medium mb-0.5">Exemples:</h5>
                        <ul className="list-disc pl-4 text-xs space-y-0.5">
                          {assetDetail.examples.map((example, idx) => (
                            <li key={idx} className="text-muted-foreground">{example}</li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Profil d'investisseur correspondant */}
            <div>
              <h3 className="text-sm font-semibold mb-1">Adapté pour</h3>
              <ul className="list-disc pl-4 space-y-0.5">
                {portfolio.suitableFor.map((item, index) => (
                  <li key={index} className="text-xs text-muted-foreground">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
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

export default PortfolioDetailsDialog;
