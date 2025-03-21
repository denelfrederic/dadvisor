
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Portfolio } from "@/components/PortfolioCard";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

/**
 * Interface pour les propriétés du composant PortfolioDetailsDialog
 * @param portfolio - Objet contenant les données du portefeuille à afficher
 * @param isOpen - État indiquant si la boîte de dialogue est ouverte
 * @param onClose - Fonction de rappel appelée lorsque l'utilisateur ferme la boîte de dialogue
 */
interface PortfolioDetailsDialogProps {
  portfolio: Portfolio | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Composant PortfolioDetailsDialog - Affiche les détails complets d'un portefeuille dans une boîte de dialogue
 */
const PortfolioDetailsDialog = ({ portfolio, isOpen, onClose }: PortfolioDetailsDialogProps) => {
  // Si aucun portefeuille n'est sélectionné, ne rien afficher
  if (!portfolio) return null;
  
  // Fonction pour obtenir une description de la thèse d'investissement (objectif) du portefeuille
  const getInvestmentThesis = (portfolio: Portfolio) => {
    // Utiliser la thèse si disponible, sinon générer un texte basé sur le niveau de risque
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
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{portfolio.name}</DialogTitle>
          <DialogDescription>
            Niveau de risque : <span className="font-medium">{portfolio.riskLevel}</span> | 
            Rendement attendu : <span className="font-medium">{portfolio.expectedReturn}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Thèse d'investissement */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Thèse d'investissement</h3>
            <p className="text-muted-foreground">{getInvestmentThesis(portfolio)}</p>
          </div>
          
          {/* Description détaillée */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{portfolio.description}</p>
          </div>
          
          {/* Tableau détaillé de l'allocation */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Répartition détaillée</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actif</TableHead>
                  <TableHead className="text-right">Pourcentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.assets.map((asset, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getAssetColor(index) }}
                        />
                        {asset.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{asset.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Détails des classes d'actifs */}
          {portfolio.assetDetails && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Classes d'actifs détaillées</h3>
              <div className="space-y-4">
                {portfolio.assetDetails.map((assetDetail, index) => (
                  <Card key={index} className="p-4">
                    <h4 className="font-medium text-base mb-1">{assetDetail.category}</h4>
                    <p className="text-muted-foreground text-sm mb-3">{assetDetail.description}</p>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium mb-1">Exemples d'actifs:</h5>
                      <ul className="list-disc pl-5 text-sm space-y-1">
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
            <h3 className="text-lg font-semibold mb-2">Adapté pour</h3>
            <ul className="list-disc pl-5 space-y-1">
              {portfolio.suitableFor.map((item, index) => (
                <li key={index} className="text-muted-foreground">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Fonction utilitaire pour obtenir une couleur pour la visualisation de l'allocation d'actifs
 * @param index - Index de l'actif dans le tableau
 * @returns Une couleur au format hexadécimal
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
