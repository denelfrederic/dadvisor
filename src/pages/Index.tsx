
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";
import { useParallax } from "@/hooks/use-parallax";

/**
 * Page d'accueil de l'application
 * Utilise un hook personnalisé pour l'effet de parallaxe et contient toutes les sections principales
 */
const Index = () => {
  // Utilisation du hook personnalisé pour l'effet de parallaxe
  const parallaxOffset = useParallax();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">
        <HeroSection parallaxOffset={parallaxOffset} />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Index;
