
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HelpCircle, User, Wallet, Shield, BarChart3 } from "lucide-react";

/**
 * Composant FaqCategories - Affiche les catégories de FAQ pour filtrer les questions
 */
const FaqCategories = () => {
  const [activeCategory, setActiveCategory] = useState("général");

  const categories = [
    { id: "général", label: "Questions générales", icon: <HelpCircle size={18} /> },
    { id: "compte", label: "Compte et profil", icon: <User size={18} /> },
    { id: "coffre", label: "Coffre numérique", icon: <Wallet size={18} /> },
    { id: "sécurité", label: "Sécurité et confidentialité", icon: <Shield size={18} /> },
    { id: "investissement", label: "Investissements", icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="space-y-2 sticky top-24">
      <h3 className="font-medium text-lg mb-4">Catégories</h3>
      <div className="flex flex-col space-y-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            className={cn(
              "justify-start",
              activeCategory === category.id
                ? "bg-muted text-primary"
                : "hover:bg-muted/50"
            )}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FaqCategories;
