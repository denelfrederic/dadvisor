
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

/**
 * Page d'accueil de l'application
 * Gère l'effet de parallaxe au défilement et contient toutes les sections principales
 */
const Index = () => {
  // État pour suivre la position de défilement pour l'effet de parallaxe
  const [scrollY, setScrollY] = useState(0);
  
  // Effet pour écouter l'événement de défilement
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  // Calcul du décalage pour l'effet de parallaxe
  const parallaxOffset = scrollY * 0.25;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection parallaxOffset={parallaxOffset} />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
