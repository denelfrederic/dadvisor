
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
 * Affiche le message principal de l'application avec des animations et un effet de parallaxe
 */
const HeroSection = ({
  parallaxOffset
}: HeroSectionProps) => {
  return <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Arrière-plan avec effet de parallaxe */}
      <div className="absolute inset-0 -z-10" style={{
      transform: `translateY(${parallaxOffset * 0.5}px)`,
      backgroundImage: "radial-gradient(circle at 50% 50%, rgba(238, 240, 255, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%)",
      opacity: 0.7
    }}></div>
      
      <div className="container mx-auto px-4 pt-32 md:pt-24 lg:pt-0">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Conteneur principal avec animation d'entrée - Côté texte */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }} 
            className="text-center lg:text-left mb-8 lg:mb-0 lg:w-1/2 z-10"
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
            
            {/* Titre principal avec animation - TEXTE MODIFIÉ ICI */}
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
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button size="lg" asChild>
                <Link to="/questionnaire">Découvrir mon profil</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/portfolios">Explorer les portefeuilles</Link>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Image illustrative avec animation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.6 }} 
            className="lg:w-1/2 hidden md:block"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-dadvisor">
              <img 
                src="/lovable-uploads/ff203da3-ea3b-4d92-865d-0899d2e0ebcd.png" 
                alt="Conseiller financier professionnel expliquant un plan d'investissement à des clients" 
                className="w-full h-auto rounded-2xl object-cover"
              />
              <div className="absolute inset-0 bg-dadvisor-blue/10 mix-blend-overlay"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};

export default HeroSection;
