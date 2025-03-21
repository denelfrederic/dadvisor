
import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import FaqSection from "@/components/faq/FaqSection";
import FaqCategories from "@/components/faq/FaqCategories";

/**
 * Page FAQ - Affiche les questions fréquemment posées organisées par catégories
 */
const Faq = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-10 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-center mb-2">Foire Aux Questions</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Trouvez des réponses aux questions les plus fréquemment posées sur DADVISOR, nos services, et le fonctionnement de notre plateforme.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FaqCategories />
          </div>
          <div className="lg:col-span-3">
            <FaqSection />
          </div>
        </div>
      </main>
      
      <BottomNavbar />
    </div>
  );
};

export default Faq;
