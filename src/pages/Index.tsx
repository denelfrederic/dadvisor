
import React from "react";
import HeroSection from "../components/landing/HeroSection";
import FeatureCard from "../components/landing/FeatureCard";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";
import { KnowledgeSearch } from "@/components/knowledge-base/KnowledgeSearch";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Boîte de recherche en première page */}
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Recherche DADVISOR</h2>
          <p className="text-center text-muted-foreground mb-6">
            Posez vos questions sur l'investissement et la finance
          </p>
          <KnowledgeSearch />
        </Card>
      </div>

      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
