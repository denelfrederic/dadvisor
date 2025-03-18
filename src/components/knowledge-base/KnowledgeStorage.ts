
import { KnowledgeEntry } from "./types";

// Functions for loading and saving the knowledge base from localStorage
export const loadKnowledgeBase = (): KnowledgeEntry[] => {
  const savedKnowledge = localStorage.getItem('knowledgeBase');
  if (savedKnowledge) {
    return JSON.parse(savedKnowledge);
  }
  
  // Default knowledge base if nothing is saved
  return [
    {
      id: '1',
      question: "Quels sont les meilleurs investissements à faible risque?",
      answer: "Les investissements à faible risque comprennent les livrets d'épargne réglementés, les fonds en euros des assurances-vie, les obligations d'État et les ETF obligataires. Ces placements offrent une sécurité élevée mais généralement un rendement modéré.",
      timestamp: Date.now()
    },
    {
      id: '2',
      question: "Comment diversifier mon portefeuille?",
      answer: "Pour diversifier votre portefeuille, répartissez vos investissements entre différentes classes d'actifs (actions, obligations, immobilier), zones géographiques, secteurs et tailles d'entreprises. Utilisez des ETF pour une diversification à moindre coût et ajustez régulièrement votre allocation en fonction de votre profil de risque.",
      timestamp: Date.now()
    },
    {
      id: '3',
      question: "Quels sont les avantages fiscaux de l'assurance-vie?",
      answer: "L'assurance-vie offre des avantages fiscaux significatifs en France: exonération des gains après 8 ans de détention (jusqu'à 4 600€ pour une personne seule, 9 200€ pour un couple), taux forfaitaire de 7,5% au-delà, et transmission facilitée hors succession jusqu'à 152 500€ par bénéficiaire.",
      timestamp: Date.now()
    }
  ];
};

export const saveKnowledgeBase = (knowledgeBase: KnowledgeEntry[]) => {
  localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
};

export const exportKnowledgeBase = (knowledgeBase: KnowledgeEntry[]) => {
  const dataStr = JSON.stringify(knowledgeBase, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
