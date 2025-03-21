
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Interface pour les propriétés du composant HeroSection
 * @param parallaxOffset - Décalage pour l'effet de parallaxe lors du défilement
 */
interface HeroSectionProps {
  parallaxOffset: number;
}

/**
 * Composant HeroSection - Section principale de la page d'accueil
 * Affiche le message principal de l'application avec des animations
 */
const HeroSection = ({
  parallaxOffset
}: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Arrière-plan avec effet de parallaxe */}
      <div 
        className="absolute inset-0 -z-10" 
        style={{
          transform: `translateY(${parallaxOffset * 0.5}px)`,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(238, 240, 255, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%)",
          opacity: 0.7
        }}
      ></div>
      
      <div className="container mx-auto px-4 pt-32 md:pt-24 lg:pt-0">
        <div className="flex flex-col items-center gap-8 lg:gap-12">
          {/* Conteneur principal avec animation d'entrée - Centralisé */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }} 
            className="text-center mb-8 z-10 max-w-3xl mx-auto"
          >
            {/* Badge supérieur avec animation */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }} 
              className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              Investissez en toute autonomie et sécurité
            </motion.div>
            
            {/* Titre principal avec animation */}
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Investissez en autonomie,{" "}
              <span className="text-primary">maîtrisez votre patrimoine</span>
            </motion.h1>
            
            {/* Description avec animation */}
            <motion.p 
              className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              DADVISOR vous aide à découvrir votre profil d'investisseur, évalue votre tolérance au risque et niveau de connaissance, puis vous propose des portefeuilles diversifiés incluant cryptos et actifs traditionnels. Vous gardez toujours le contrôle total de vos fonds - nous n'avons jamais accès à votre argent.
            </motion.p>
            
            {/* Boutons d'action avec animation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.5 }} 
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" asChild>
                <Link to="/questionnaire">Découvrir mon profil</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/portfolios">Explorer les portefeuilles</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
