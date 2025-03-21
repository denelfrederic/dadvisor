
/**
 * Fonctions pour comparer les niveaux de risque des portefeuilles
 */

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
    "wareconomy": 2, // Même niveau de risque que "balanced"
    "growth": 3
  };
  
  // Vérification de sécurité: si l'un des IDs n'est pas dans la liste, retourner false
  if (!riskLevels[selectedId] || !riskLevels[recommendedId]) {
    console.warn("Comparaison de risque impossible: portfolio ID inconnu", selectedId, recommendedId);
    return false;
  }
  
  return riskLevels[selectedId] > riskLevels[recommendedId];
};
