
import React from "react";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Page MyAdvisor - Présentation du service My Advisor AI-Pilot
 * @returns {JSX.Element} Composant MyAdvisor
 */
const MyAdvisor = () => {
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
              🧠 My Advisor AI-Pilot
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ton copilote intelligent pour te guider et te laisser prendre les meilleures 
              décisions d'investissement, te former, et gérer ton patrimoine en toute autonomie.
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-dadvisor-navy">
              🎯 Quel est son rôle ?
            </h2>
            <p className="mb-6">
              <strong>My Advisor AI-Pilot</strong> est un <strong>agent autonome et intelligent</strong> que l'utilisateur peut <strong>acheter sous forme d'abonnement ou de module activable</strong> dans son dashboard DADVISOR.
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
              <p className="font-bold">IL NE DONNE PAS DE CONSEILS EN INVESTISSEMENTS</p>
            </div>
            <p>
              Il agit comme un <strong>coach personnel augmenté</strong>, dédié à trois missions principales :
            </p>
          </div>

          {/* Section 1 */}
          <FeatureSection
            number="1"
            title="T'AIDER À FAIRE LES BONS CHOIX D'INVESTISSEMENT"
            icon="🧩"
            example="Vu ton appétence au risque modéré et ton horizon à 5 ans, je te suggère d'ajuster ton exposition aux techs US et de renforcer ton allocation anti-inflation."
          >
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Il analyse <strong>ton profil de risque, tes objectifs et ton horizon de placement</strong>.</li>
              <li>Il te propose des <strong>portfolios personnalisés</strong> construits avec l'IA de DADVISOR.</li>
              <li>Il t'alerte sur les <strong>opportunités et risques en temps réel</strong> (volatilité, arbitrage, diversification).</li>
            </ul>
          </FeatureSection>

          {/* Section 2 */}
          <FeatureSection
            number="2"
            title="TE FORMER EN CONTINU"
            icon="📚"
            example="Tu as sélectionné un actif relié à l'or physique. Souhaites-tu comprendre comment fonctionne la tokenisation d'un actif réel ? Voici une vidéo de 3 minutes."
          >
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>My Advisor AI-Pilot te propose des <strong>capsules éducatives dynamiques</strong> selon tes interactions et ton niveau (vidéos, quiz, articles).</li>
              <li>Il t'explique <strong>chaque terme ou stratégie</strong> que tu rencontres sur la plateforme.</li>
              <li>Il construit <strong>un parcours pédagogique sur-mesure</strong> pour faire de toi un investisseur éclairé.</li>
            </ul>
          </FeatureSection>

          {/* Section 3 */}
          <FeatureSection
            number="3"
            title="T'ACCOMPAGNER DANS LA GESTION DE TON PATRIMOINE"
            icon="🧮"
            example="Ton portefeuille est déséquilibré suite à la hausse des cryptos. Souhaites-tu le rebalancer automatiquement pour revenir à ta stratégie initiale ?"
          >
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Il suit la <strong>performance globale</strong> de tes ARTs et portfolios.</li>
              <li>Il te propose des <strong>bilans réguliers</strong> et des ajustements d'allocation.</li>
              <li>Il peut être programmé pour <strong>rééquilibrer automatiquement tes investissements</strong> selon tes préférences.</li>
            </ul>
          </FeatureSection>

          {/* Bonus Section */}
          <div className="bg-gradient-to-r from-dadvisor-blue/10 to-dadvisor-navy/10 p-8 rounded-2xl mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="mr-2">🔐</span> Et en bonus ?
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Il est <strong>totalement privé</strong> : ton AI-Pilot te connaît mais <strong>ne partage rien</strong> avec des tiers.</li>
              <li>Il est <strong>multi-interface</strong> : accessible dans ton tableau de bord, sur ton mobile ou via commande vocale).</li>
              <li>Il est <strong>entraîné en continu</strong> sur les contenus DADVISOR, les évolutions macroéconomiques, les tendances IA/Blockchain et les marchés.</li>
            </ul>
          </div>

          {/* CTA Button */}
          <div className="text-center my-12">
            <Button asChild size="lg" className="px-8 py-6 text-lg">
              <Link to="/questionnaire">
                Commencer l'expérience My Advisor
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
      <BottomNavbar />
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
  example: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  number,
  title,
  icon,
  children,
  example
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
      <div className="bg-dadvisor-lightblue/30 p-4 rounded-lg">
        <p className="flex items-start">
          <span className="text-xl mr-2">💡</span>
          <em className="text-dadvisor-navy">{example}</em>
        </p>
      </div>
    </motion.div>
  );
};

export default MyAdvisor;
