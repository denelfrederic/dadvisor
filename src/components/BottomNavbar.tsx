
import { Link } from "react-router-dom";
import { Facebook, Twitter, Github, MessageCircle, Headphones, HelpCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

/**
 * Composant BottomNavbar - Barre de navigation discrète en bas de page
 * Présente sur toutes les pages de l'application
 */
const BottomNavbar = () => {
  const [isSocialHovered, setSocialHovered] = useState(false);

  // Fonction pour afficher un toast "Bientôt !" quand on clique sur une icône sociale
  const handleSocialClick = (platform: string) => {
    toast({
      title: "Bientôt !",
      description: `Notre ${platform} sera disponible prochainement.`,
      duration: 3000,
    });
  };

  return (
    <div className="bg-background/80 backdrop-blur-sm border-t py-3 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Navigation principale */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">
              Qui sommes nous
            </Link>
            <Link to="/vision" className="hover:text-primary transition-colors">
              Vision
            </Link>
            <Link to="/roadmap" className="hover:text-primary transition-colors">
              RoadMap
            </Link>
            <Link to="/dao" className="hover:text-primary transition-colors">
              DAO
            </Link>
            <Link to="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Icônes des réseaux sociaux */}
          <div 
            className="flex gap-4 justify-center md:justify-end"
            onMouseEnter={() => setSocialHovered(true)}
            onMouseLeave={() => setSocialHovered(false)}
          >
            <button 
              onClick={() => handleSocialClick("Discord")}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Discord"
            >
              <Headphones size={20} />
            </button>
            <button 
              onClick={() => handleSocialClick("Twitter")}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </button>
            <button 
              onClick={() => handleSocialClick("Facebook")}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </button>
            <button 
              onClick={() => handleSocialClick("Github")}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Github"
            >
              <Github size={20} />
            </button>
            <button 
              onClick={() => handleSocialClick("Chat")}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Message"
            >
              <MessageCircle size={20} />
            </button>
            <Link 
              to="/faq"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="FAQ"
            >
              <HelpCircle size={20} />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-xs text-center text-muted-foreground mt-4">
          © 2025 DADVISOR. Tous droits réservés.
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;
