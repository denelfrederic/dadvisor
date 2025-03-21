/**
 * Données et utilitaires pour les portefeuilles d'investissement
 */

import { Portfolio } from "@/components/PortfolioCard";

// Descriptions des portefeuilles disponibles
export const portfolios: Portfolio[] = [
  {
    id: "conservative",
    name: "Portefeuille Prudent",
    riskLevel: "Faible",
    description: "Une approche conservatrice axée sur la préservation du capital avec une volatilité minimale.",
    expectedReturn: "3% - 5% par an",
    thesis: "Ce portefeuille vise à préserver votre capital tout en générant des revenus stables. Il est conçu pour résister aux turbulences des marchés et protéger vos actifs contre l'inflation et les crises économiques.",
    assets: [
      { name: "Métaux Précieux", percentage: 40 },
      { name: "Bitcoin", percentage: 20 },
      { name: "Actions", percentage: 20 },
      { name: "Immobilier", percentage: 10 },
      { name: "Liquidités", percentage: 10 }
    ],
    assetDetails: [
      {
        category: "Métaux Précieux (40%)",
        description: "Protection contre l'inflation et valeur refuge en période d'incertitude économique",
        examples: [
          "Or physique (lingots, pièces)",
          "Argent physique",
          "ETF adossés à l'or (PHAU, GLD)",
          "Actions de mines d'or sélectionnées"
        ]
      },
      {
        category: "Bitcoin (20%)",
        description: "Exposition mesurée à la principale cryptomonnaie comme réserve de valeur numérique",
        examples: [
          "Bitcoin détenu sur des plateformes sécurisées",
          "Solutions de garde institutionnelles",
          "ETF Bitcoin (FBTC, BTCE)"
        ]
      },
      {
        category: "Actions (20%)",
        description: "Sélection d'entreprises établies à faible volatilité et dividendes stables",
        examples: [
          "Actions de grande capitalisation à dividendes (secteurs défensifs)",
          "ETF sur indices larges (S&P 500, MSCI World)",
          "Entreprises du secteur des matières premières",
          "Actions de valeur (value stocks)"
        ]
      },
      {
        category: "Immobilier (10%)",
        description: "Exposition aux actifs réels générant des revenus locatifs",
        examples: [
          "SCPI (Sociétés Civiles de Placement Immobilier)",
          "OPCI (Organismes de Placement Collectif Immobilier)",
          "ETF immobiliers (foncières cotées)",
          "Immobilier tokenisé sur blockchain"
        ]
      },
      {
        category: "Liquidités (10%)",
        description: "Réserve de sécurité immédiatement disponible",
        examples: [
          "Comptes d'épargne à haut rendement",
          "Stablecoins adossés à des monnaies fiduciaires",
          "Bons du Trésor à court terme",
          "Livrets et comptes à terme"
        ]
      }
    ],
    suitableFor: [
      "Investisseurs avec un horizon à court terme",
      "Personnes proches de la retraite",
      "Investisseurs avec une faible tolérance au risque",
      "Préservation du capital comme objectif principal"
    ]
  },
  {
    id: "balanced",
    name: "Portefeuille Équilibré",
    riskLevel: "Modéré",
    description: "Un équilibre entre croissance et stabilité, offrant un compromis risque-rendement attractif.",
    expectedReturn: "5% - 8% par an",
    thesis: "Ce portefeuille cherche à équilibrer la croissance du capital et la protection. Il est conçu pour capturer les opportunités de marché tout en intégrant des éléments stabilisateurs qui réduisent la volatilité globale.",
    assets: [
      { name: "Actions", percentage: 50 },
      { name: "Bitcoin", percentage: 30 },
      { name: "Immobilier", percentage: 15 },
      { name: "Or", percentage: 5 }
    ],
    assetDetails: [
      {
        category: "Actions (50%)",
        description: "Exposition diversifiée aux marchés d'actions mondiaux pour la croissance à long terme",
        examples: [
          "Actions de croissance (growth stocks)",
          "ETF sectoriels (technologies, santé, énergie)",
          "Actions de marchés émergents sélectionnés",
          "Actions de moyenne capitalisation à fort potentiel"
        ]
      },
      {
        category: "Bitcoin (30%)",
        description: "Allocation substantielle à la principale cryptomonnaie pour capturer sa croissance potentielle",
        examples: [
          "Bitcoin détenu en self-custody (cold storage)",
          "Services de staking Bitcoin",
          "ETF et ETP Bitcoin",
          "Solutions d'épargne Bitcoin automatisées"
        ]
      },
      {
        category: "Immobilier (15%)",
        description: "Diversification via des actifs immobiliers productifs de revenus",
        examples: [
          "SCPI à rendement (bureaux, commerces, logistique)",
          "Foncières cotées internationales",
          "Plateformes de crowdfunding immobilier",
          "Immobilier tokenisé sur blockchain"
        ]
      },
      {
        category: "Or (5%)",
        description: "Couverture contre l'inflation et élément stabilisateur du portefeuille",
        examples: [
          "ETF or physique",
          "Or tokenisé sur blockchain",
          "Certificats adossés à l'or",
          "Actions de mines d'or"
        ]
      }
    ],
    suitableFor: [
      "Investisseurs avec un horizon à moyen terme",
      "Personnes cherchant un équilibre risque-rendement",
      "Investisseurs avec une tolérance modérée au risque",
      "Diversification et croissance comme objectifs"
    ]
  },
  {
    id: "growth",
    name: "Portefeuille Croissance",
    riskLevel: "Élevé",
    description: "Une approche dynamique visant une croissance significative du capital sur le long terme.",
    expectedReturn: "6% - 40% par an",
    thesis: "Ce portefeuille est conçu pour maximiser la croissance du capital sur le long terme. Il adopte une approche dynamique en privilégiant les actifs à fort potentiel de croissance, au prix d'une volatilité plus importante à court terme.",
    assets: [
      { name: "Actions", percentage: 60 },
      { name: "Cryptomonnaies", percentage: 30 },
      { name: "DEFI", percentage: 10 }
    ],
    assetDetails: [
      {
        category: "Actions (60%)",
        description: "Allocation importante aux marchés actions mondiaux avec focus sur la croissance",
        examples: [
          "Actions de croissance à haute conviction",
          "Small caps innovantes",
          "Secteurs disruptifs (IA, biotechnologie, énergie propre)",
          "Actions de marchés émergents à fort potentiel",
          "ETF thématiques (robotique, cybersécurité, métavers)"
        ]
      },
      {
        category: "Cryptomonnaies (30%)",
        description: "Exposition diversifiée aux crypto-actifs établis et émergents",
        examples: [
          "Bitcoin (60% de l'allocation crypto)",
          "Ethereum (20% de l'allocation crypto)",
          "Layer 1 alternatives (Solana, Avalanche, etc.)",
          "Cryptomonnaies à forte capitalisation (top 20)",
          "Projets blockchain à usage réel validé"
        ]
      },
      {
        category: "DEFI (10%)",
        description: "Participation aux innovations de la finance décentralisée pour générer des rendements",
        examples: [
          "Staking de cryptomonnaies",
          "Yield farming sur plateformes DeFi établies",
          "Lending (prêts) sur protocoles décentralisés",
          "Liquidity mining",
          "Produits structurés DeFi"
        ]
      }
    ],
    suitableFor: [
      "Investisseurs avec un horizon à long terme",
      "Personnes jeunes loin de la retraite",
      "Investisseurs avec une forte tolérance au risque",
      "Croissance maximale du capital comme objectif"
    ]
  },
  {
    id: "wareconomy",
    name: "Économie de Guerre",
    riskLevel: "Modéré",
    description: "Un portefeuille axé sur la souveraineté française et européenne, soutenant les entreprises stratégiques dans un contexte de réarmement économique.",
    expectedReturn: "5% - 9% par an",
    thesis: "Ce portefeuille vise à soutenir le développement et le renforcement d'un cadre de défense et de sécurité européen en investissant exclusivement dans des entreprises françaises et européennes qui contribuent à la résilience nationale et continentale. Il s'agit d'une alternative aux initiatives gouvernementales, proposant une approche basée sur le marché pour soutenir les acteurs privés pertinents.",
    assets: [
      { name: "Défense & Aérospatial", percentage: 30 },
      { name: "Cybersécurité", percentage: 20 },
      { name: "Industrie Stratégique", percentage: 20 },
      { name: "Énergie", percentage: 15 },
      { name: "Transports & Logistique", percentage: 10 },
      { name: "Infrastructure Critique", percentage: 5 }
    ],
    assetDetails: [
      {
        category: "Défense & Aérospatial (30%)",
        description: "Entreprises impliquées dans la production d'équipements militaires, aéronautiques et spatiaux",
        examples: [
          "Thales (France)",
          "Airbus Defence and Space (UE)",
          "Dassault Aviation (France)",
          "Safran (France)",
          "Naval Group (France)"
        ]
      },
      {
        category: "Cybersécurité (20%)",
        description: "Solutions et services de protection des systèmes d'information et infrastructures numériques",
        examples: [
          "Sophos (France)",
          "Atos (France)",
          "Capgemini Cybersécurité (France)",
          "Orange Cyberdefense (France)",
          "Darktrace (Royaume-Uni/UE)"
        ]
      },
      {
        category: "Industrie Stratégique (20%)",
        description: "Production de biens manufacturés essentiels et technologies critiques",
        examples: [
          "STMicroelectronics (France/Italie)",
          "Schneider Electric (France)",
          "ASML (Pays-Bas)",
          "Sanofi (France - médicaments stratégiques)",
          "Arkema (France - chimie de spécialité)"
        ]
      },
      {
        category: "Énergie (15%)",
        description: "Production et gestion de l'énergie avec focus sur l'autonomie énergétique",
        examples: [
          "EDF (France - nucléaire)",
          "TotalEnergies (France)",
          "Engie (France)",
          "Neoen (France - renouvelables)",
          "Siemens Energy (Allemagne)"
        ]
      },
      {
        category: "Transports & Logistique (10%)",
        description: "Infrastructures et services de transport essentiels à la résilience économique",
        examples: [
          "SNCF (obligations, France)",
          "Alstom (France)",
          "CMA CGM (France)",
          "Bolloré Logistics (France)",
          "Deutsche Post DHL Group (Allemagne)"
        ]
      },
      {
        category: "Infrastructure Critique (5%)",
        description: "Services publics et infrastructures essentielles à la sécurité nationale",
        examples: [
          "Veolia (France - eau, déchets)",
          "Suez (France - eau)",
          "Eiffage (France - construction)",
          "Bouygues (France - BTP)",
          "Vinci (France - concessions, construction)"
        ]
      }
    ],
    suitableFor: [
      "Investisseurs souhaitant soutenir la souveraineté économique européenne",
      "Personnes cherchant une alternative aux initiatives de prêt gouvernemental",
      "Investisseurs avec une perspective défense et sécurité",
      "Profils patriotiques voulant allier rendement et impact national"
    ]
  }
];

/**
 * Retourne tous les portefeuilles disponibles
 * @returns La liste des portefeuilles
 */
export const getPortfolios = (): Portfolio[] => {
  return portfolios;
};

/**
 * Trouve un portefeuille par son ID
 * @param portfolioId L'ID du portefeuille à rechercher
 * @returns Le portefeuille correspondant ou undefined si non trouvé
 */
export const getPortfolioById = (portfolioId: string): Portfolio | undefined => {
  return portfolios.find(portfolio => portfolio.id === portfolioId);
};

/**
 * Détermine le profil d'investissement recommandé basé sur le score de risque
 * @param riskScore Le score de risque calculé
 * @returns L'ID du portefeuille recommandé
 */
export const getRecommendedPortfolio = (riskScore: number): string => {
  // Vérifie d'abord la préférence pour "Économie de Guerre" basée sur la question sovereignty
  // Cette vérification serait normalement faite à partir des réponses au questionnaire
  // Nous implémentons une version simplifiée ici
  const hasSovereigntyPreference = localStorage.getItem('dadvisor_temp_answers') ? 
    JSON.parse(localStorage.getItem('dadvisor_temp_answers') || '{}')['sovereignty']?.value >= 3 : false;
  
  if (hasSovereigntyPreference) {
    return "wareconomy";
  }
  
  // Sinon, utiliser la logique habituelle basée sur le score de risque
  if (riskScore < 40) {
    return "conservative";
  } else if (riskScore < 70) {
    return "balanced";
  } else {
    return "growth";
  }
};

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
  
  return riskLevels[selectedId] > riskLevels[recommendedId];
};
