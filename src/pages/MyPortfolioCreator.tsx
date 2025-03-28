
import React from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Page MyPortfolioCreator - Présentation du service My Portfolio Creator X
 * @returns {JSX.Element} Composant MyPortfolioCreator
 */
const MyPortfolioCreator = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dadvisor-blue">
              🧬 My Portfolio Creator X
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compose ton propre portefeuille comme un pro, à partir de milliers d'actifs tokenisés, 
              cryptos et produits financiers du monde réel.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-dadvisor-navy">
              🌐 Qu'est-ce que c'est ?
            </h2>
            <p className="mb-4">
              <strong>My Portfolio Creator</strong> est une <strong>option premium avancée</strong> qui permet 
              à tout utilisateur (crypto-curieux ou investisseur expérimenté) de <strong>créer, backtester et déployer</strong> ses 
              propres portefeuilles personnalisés.
            </p>
            <p className="mb-4">
              C'est un <strong>atelier de création patrimoniale décentralisé</strong>, à la fois puissant, simple et guidé par l'IA.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-dadvisor-navy">
            🛠️ Ce que permet Portfolio Creator X
          </h2>

          {/* Section 1 */}
          <FeatureSection
            number="1"
            title="Accès à un méga catalogue de +5 000 actifs"
            icon="🔍"
          >
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Crypto-actifs</strong> : tokens layer 1, DeFi, AI, NFT, stablecoins, memecoins sélectionnés.</li>
              <li><strong>Actifs du monde réel tokenisés (RWA)</strong> : or, immobilier, actions du monde entier, obligations, matières premières, ETF.</li>
              <li><strong>Produits structurés tokenisés</strong></li>
            </ul>
            <div className="bg-dadvisor-lightblue/30 p-4 rounded-lg">
              <p>💡 Tous les actifs sont <strong>filtrables</strong> par type, risque, rendement cible, durée</p>
            </div>
          </FeatureSection>

          {/* Section 2 */}
          <FeatureSection
            number="2"
            title="Création assistée par l'IA"
            icon="🧠"
          >
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Sélection intuitive des actifs avec <strong>suggestions intelligentes</strong> en fonction du profil utilisateur.</li>
              <li>Simulation en temps réel des performances historiques, stress tests, ratio Sharpe, drawdown, etc.</li>
              <li>Recommandation de <strong>répartition optimale</strong> selon les objectifs : rendement, protection, diversification, croissance.</li>
            </ul>
            <div className="bg-dadvisor-lightblue/30 p-4 rounded-lg">
              <p className="italic">💡 "Tu veux un portefeuille 40% croissance, 30% inflation hedge, 30% revenu passif avec faible corrélation BTC ? Voici 3 propositions générées par ton AI."</p>
            </div>
          </FeatureSection>

          {/* Section 3 */}
          <FeatureSection
            number="3"
            title="Déploiement instantané & self-custody"
            icon="🚀"
          >
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Une fois validé, ton portefeuille est <strong>tokenisé automatiquement en un ART unique ou en plusieurs ARTs combinés</strong>.</li>
              <li>Tes jetons sont livrés directement dans ton coffre numérique*, sans tiers de confiance.</li>
            </ul>
          </FeatureSection>

          {/* Section 4 */}
          <FeatureSection
            number="4"
            title="Rebalancement & arbitrage dynamique"
            icon="🔁"
          >
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Possibilité de <strong>programmer des stratégies automatiques</strong> : DCA, arbitrage inter-portefeuilles, prise de profits, stop loss.</li>
              <li>L'IA te notifie des ajustements potentiels et te propose un rebalancement intelligent en un clic.</li>
            </ul>
            <div className="bg-dadvisor-lightblue/30 p-4 rounded-lg">
              <p className="italic">💡 "La part de ton ART 'AI Frontier' dépasse 45% suite à la hausse de FET et TAO. Souhaites-tu rebalancer pour limiter ton exposition sectorielle ?"</p>
            </div>
          </FeatureSection>

          {/* Fonctionnalités bonus */}
          <div className="bg-gradient-to-r from-dadvisor-blue/10 to-dadvisor-navy/10 p-8 rounded-2xl mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="mr-2">🧩</span> Fonctionnalités bonus
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Labelisation DAO</strong> possible si tu veux proposer ton portfolio à d'autres membres de la communauté.</li>
            </ul>
          </div>

          {/* À qui s'adresse */}
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-dadvisor-navy flex items-center">
              <span className="mr-2">👑</span> À qui s'adresse Portfolio Creator X ?
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>À ceux qui veulent <strong>un contrôle total sur leur patrimoine tokenisé</strong>, sans dépendre d'un gestionnaire.</li>
              <li>Aux <strong>investisseurs avancés</strong> souhaitant tester et implémenter leurs propres convictions.</li>
              <li>Aux <strong>communautés ou CGP</strong> désirant créer des portefeuilles sur mesure pour leurs clients.</li>
            </ul>
          </div>

          {/* CTA Button */}
          <div className="text-center my-12">
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link to="/portfolios">
                RDV en 2026
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Composant pour afficher une section de fonctionnalité
 */
interface FeatureSectionProps {
  number: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  number,
  title,
  icon,
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white shadow-lg rounded-2xl p-8 mb-8"
    >
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <span className="mr-2">{icon}</span> {number}. <span className="ml-2">{title}</span>
      </h2>
      {children}
    </motion.div>
  );
};

export default MyPortfolioCreator;
