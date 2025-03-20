
import { QuestionnaireResponses } from "./types";

/**
 * Génère une analyse personnalisée du style d'investissement basée sur des réponses spécifiques
 * @param responses Les réponses au questionnaire
 * @returns Analyse textuelle du style d'investissement
 */
export const analyzeInvestmentStyle = (responses: QuestionnaireResponses): string[] => {
  const insights: string[] = [];
  
  // Analyse de l'horizon d'investissement
  if (responses.horizon) {
    if (responses.horizon.value === 1) {
      insights.push("Votre horizon d'investissement court suggère que vous pourriez avoir besoin d'accéder à vos fonds prochainement. DADVISOR vous recommande de privilégier la liquidité et la stabilité dans vos choix d'investissement, mais la décision finale vous appartient toujours.");
    } else if (responses.horizon.value >= 3) {
      insights.push("Votre horizon d'investissement long est idéal pour bénéficier de la croissance composée et traverser les cycles du marché. Cela vous permet d'envisager des actifs plus volatils mais potentiellement plus rentables à long terme.");
    }
  }
  
  // Analyse de la tolérance au risque
  if (responses.risk) {
    if (responses.risk.value === 4) {
      insights.push("Votre approche proactive face aux baisses de marché indique une forte résilience émotionnelle et une bonne compréhension des cycles d'investissement. Cette attitude est précieuse pour investir dans des marchés volatils comme celui des cryptomonnaies.");
    } else if (responses.risk.value === 1) {
      insights.push("Votre prudence face aux baisses de marché suggère que vous préférez protéger votre capital plutôt que de prendre des risques supplémentaires. DADVISOR peut vous aider à identifier des options d'investissement adaptées, sans jamais toucher à vos fonds.");
    }
  }
  
  // Analyse de la capacité d'investissement
  if (responses.income) {
    if (responses.income.value >= 3) {
      insights.push("Votre capacité à consacrer une part significative de vos revenus à l'investissement vous permet de constituer un portefeuille diversifié plus rapidement. Gardez à l'esprit l'importance de maintenir un fonds d'urgence accessible avant d'investir dans des actifs moins liquides.");
    }
  }
  
  // Analyse des connaissances financières
  if (responses.knowledge) {
    if (responses.knowledge.value <= 2) {
      insights.push("Votre niveau de connaissance financière actuel est un excellent point de départ. DADVISOR vous accompagne pour comprendre votre profil, mais nous vous encourageons à continuer d'apprendre sur les différentes classes d'actifs pour prendre des décisions plus éclairées, tout en gardant toujours le contrôle total de vos investissements.");
    } else {
      insights.push("Votre niveau de connaissance financière vous permet de comprendre les nuances entre différentes stratégies d'investissement. Cela vous aide à évaluer plus précisément les opportunités et les risques dans votre parcours d'investissement.");
    }
  }
  
  // Analyse des objectifs financiers
  if (responses.goal) {
    if (responses.goal.value === 1) {
      insights.push("Votre priorité de préserver le capital indique que vous préférez la sécurité avant tout. DADVISOR peut vous aider à comprendre quels portefeuilles correspondent à ce profil, tout en vous laissant la liberté totale quant à la gestion de vos fonds.");
    } else if (responses.goal.value === 4) {
      insights.push("Votre objectif de croissance maximale du capital s'aligne bien avec une stratégie d'investissement à long terme incluant des actifs à fort potentiel comme certaines cryptomonnaies et actions de croissance.");
    }
  }
  
  // Ajouter un insight général sur l'auto-conservation
  insights.push("Rappel important : DADVISOR vous aide uniquement à comprendre votre profil d'investisseur et à explorer des options adaptées. Vous gardez à tout moment le contrôle total de vos fonds et prenez vos propres décisions d'investissement. Nous ne gérons jamais vos actifs ni n'avons accès à vos portefeuilles.");
  
  return insights;
};
