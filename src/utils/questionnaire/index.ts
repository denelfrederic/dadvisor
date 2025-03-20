
// Exporter les types
export * from "./types";

// Exporter les questions
export { questions } from "./questions";

// Exporter les fonctions de calcul de score
export {
  calculateRiskScore,
  getRecommendedPortfolio,
  hasCompletedQuestionnaire,
  hasPassedValidationThreshold
} from "./scoring";

// Exporter les fonctions d'analyse de profil
export { getInvestorProfileAnalysis } from "./profiles";

// Exporter les fonctions d'analyse de style d'investissement
export { analyzeInvestmentStyle } from "./insights";
