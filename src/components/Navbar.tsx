
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/utils/auth";

/**
 * Composant Navbar - Barre de navigation principale de l'application
 * Change d'apparence lors du défilement et met en évidence le lien actif
 */
const Navbar = () => {
  // État pour suivre si l'utilisateur a fait défiler la page
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Effet pour détecter le défilement et mettre à jour l'état
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Effet pour vérifier si un utilisateur est connecté
  useEffect(() => {
    // Vérifier s'il y a un utilisateur dans le localStorage
    const storedUser = localStorage.getItem("dadvisor_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Si un utilisateur se connecte, on met à jour l'état
          const userData = localStorage.getItem("dadvisor_user");
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } else if (event === "SIGNED_OUT") {
          // Si un utilisateur se déconnecte, on réinitialise l'état
          setUser(null);
        }
      }
    );

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAccountManagement = () => {
    navigate("/account");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/8c04feb5-4e71-478f-9b9d-105fbaba9a69.png" 
            alt="DADVISOR" 
            className="h-24"
          />
        </Link>
        
        {/* Liens de navigation - version desktop */}
        <div className="hidden md:flex space-x-6 items-center">
          <NavLink to="/" label="Accueil" currentPath={location.pathname} />
          <NavLink to="/questionnaire" label="Questionnaire" currentPath={location.pathname} />
          <NavLink to="/portfolios" label="Portefeuilles" currentPath={location.pathname} />
          <NavLink to="/wallet" label="Wallet" currentPath={location.pathname} />
          
          {user ? (
            <Button 
              variant="outline" 
              className="ml-4 hover:bg-dadvisor-lightblue" 
              onClick={handleAccountManagement}
            >
              Connecté comme "{user.email}"
            </Button>
          ) : (
            <Button asChild className="ml-4">
              <Link to="/auth">Connexion</Link>
            </Button>
          )}
        </div>
        
        {/* Bouton de menu - version mobile */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </Button>
      </div>
    </motion.nav>
  );
};

/**
 * Interface pour les propriétés du composant NavLink
 * @param to - URL de destination du lien
 * @param label - Texte à afficher
 * @param currentPath - Chemin actuel pour détecter si le lien est actif
 */
interface NavLinkProps {
  to: string;
  label: string;
  currentPath: string;
}

/**
 * Composant NavLink - Lien de navigation avec indication visuelle de l'élément actif
 * Composant interne utilisé par Navbar
 */
const NavLink = ({ to, label, currentPath }: NavLinkProps) => {
  const isActive = currentPath === to;
  
  return (
    <Link to={to} className="relative group">
      <span className={`text-sm font-medium transition-colors ${
        isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"
      }`}>
        {label}
      </span>
      <AnimatePresence>
        {isActive && (
          <motion.span 
            className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"
            initial={{ width: 0, left: "50%", right: "50%" }}
            animate={{ width: "100%", left: 0, right: 0 }}
            exit={{ width: 0, left: "50%", right: "50%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </Link>
  );
};

export default Navbar;
