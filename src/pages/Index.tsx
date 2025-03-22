
import React from "react";
import HeroSection from "../components/landing/HeroSection";
import FeatureCard from "../components/landing/FeatureCard";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";
import { useParallax } from "@/hooks/use-parallax";

const Index = () => {
  // Utiliser le hook useParallax pour obtenir la valeur parallaxOffset
  const parallaxOffset = useParallax();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <HeroSection parallaxOffset={parallaxOffset} />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
