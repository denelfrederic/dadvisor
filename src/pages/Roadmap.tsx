import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Page Roadmap - Présentation des étapes futures du projet
 */
const Roadmap = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-bold mb-4">Roadmap</h1>
        <h2 className="text-xl text-primary mb-8">DADVISOR 2025 (version actualisée) 🚀</h2>
        
        <div className="space-y-12 max-w-4xl mx-auto">
          {/* Q1 2025 */}
          <RoadmapItem 
            emoji="✅" 
            period="Q1 2025"
            title="Mise en ligne MVP"
            className="border-l-green-500"
          >
            <ul className="list-disc pl-5 space-y-2">
              <li>Lancement du service avec liste d'attente.</li>
              <li>Création des pitch decks et pages explicatives des portfolios.</li>
              <li>Intégration initiale d'IBEX Safe (self-custody).</li>
              <li>Lancement des réseaux sociaux (LinkedIn, Discord, X).</li>
              <li>Structuration organisationnelle : DAO portée juridiquement par une association loi 1901.</li>
              <li>Mise en place des jetons DADVISOR : Tokenomics, gouvernance, allocation.</li>
            </ul>
          </RoadmapItem>
          
          {/* Q2 2025 */}
          <RoadmapItem 
            emoji="⚙️" 
            period="Q2 2025"
            title="Bêta tests & Pré marketing"
            className="border-l-blue-500"
          >
            <ul className="list-disc pl-5 space-y-2">
              <li>Bêta tests utilisateurs pour valider l'UX/UI, les parcours et la transparence.</li>
              <li>Intégration complète d'IBEX Wallet pour fiat/crypto + KYC natif.</li>
              <li>Création des partenariats stratégiques (CGP/CIF, influenceurs Web3).</li>
              <li>Campagnes de notoriété (Product Hunt, contenus éducatifs, webinaires).</li>
            </ul>
          </RoadmapItem>
          
          {/* Q3 2025 */}
          <RoadmapItem 
            emoji="🧠" 
            period="Q3 2025"
            title="IA avancée & communauté active"
            className="border-l-purple-500"
          >
            <div className="space-y-4">
              <p>Développement de des agents intelligents IA V1 pour :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Arbitrage, rebalancing</li>
                <li>Aide aux choix stratégiques des investisseurs</li>
              </ul>
              <ul className="list-disc pl-5 space-y-2">
                <li>Amélioration du dashboard utilisateur (données en temps réel, visualisations interactives).</li>
                <li>Lancement de la communauté DADVISOR on-platform (voting DAO, forums, leaderboard).</li>
                <li>Extension des portfolios personnalisés avec mécanismes de gamification.</li>
              </ul>
            </div>
          </RoadmapItem>
          
          {/* Q4 2025 */}
          <RoadmapItem 
            emoji="💸" 
            period="Q4 2025"
            title="Prévente des jetons DAD & Portfolios"
            className="border-l-amber-500"
          >
            <div className="space-y-6">
              <div>
                <p className="font-medium mb-2">Multiplication des portfolios :</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Par des experts : création de portfolios sectoriels (ex : énergie verte, IA, marchés émergents).</li>
                  <li>Par la communauté : via la DAO, avec votes pour faire émerger des stratégies populaires.</li>
                  <li>Par l'IA : génération de portfolios personnalisés en temps réel via algorithmes d'arbitrage et de rebalancement.</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium mb-2">Vente publique :</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>30% des jetons mis sur le marché.</li>
                  <li>Fonds levés injectés dans le développement du projet, marketing et adoption.</li>
                  <li>Verrouillage (Cliff) pour les fondateurs et équipe pour éviter toute revente immédiate.</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium mb-2">Utilisation des fonds :</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>35 % développement technique</li>
                  <li>30 % marketing & acquisition</li>
                  <li>15 % conformité / audits</li>
                  <li>20 % fonds de réserve DAO (ex : couverture pertes portfolios low risk)</li>
                </ul>
              </div>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Amélioration des outils d'IA selon retours utilisateurs.</li>
                <li>Préparation à une extension internationale.</li>
                <li>Finalisation du système de rémunération automatisée via smart contracts.</li>
              </ul>
            </div>
          </RoadmapItem>
          
          {/* Vision */}
          <RoadmapItem 
            emoji="🌍" 
            period="Post-2025"
            title="Vision"
            className="border-l-teal-500"
          >
            <ul className="list-disc pl-5 space-y-2">
              <li>Plateforme d'éducation intégrée (vidéos, guides, simulateurs).</li>
              <li>Diversification de l'offre pour les investisseurs institutionnels.</li>
              <li>Intégration de nouveaux actifs numériques régulés.</li>
            </ul>
          </RoadmapItem>
        </div>
      </div>
      <BottomNavbar />
    </div>
  );
};

/**
 * Composant d'affichage d'un élément de la roadmap avec un design cohérent
 */
interface RoadmapItemProps {
  emoji: string;
  period: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const RoadmapItem = ({ emoji, period, title, children, className }: RoadmapItemProps) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 border-l-4 h-full", className)}></div>
      
      <div className="pl-8 relative">
        {/* Emoji badge */}
        <div className="absolute -left-3 top-0 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xl shadow-sm">
          {emoji}
        </div>
        
        <div className="glass-card p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-primary">{period}</h3>
            <Separator className="hidden sm:block h-5" orientation="vertical" />
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          
          <div className="text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
