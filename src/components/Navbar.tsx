
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User, getLoggedInUser } from "@/utils/auth";

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
    const loadUser = async () => {
      // Force refresh from Supabase to ensure we have the latest data
      const currentUser = await getLoggedInUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Si aucun utilisateur trouvé, nettoyer l'état
        setUser(null);
      }
    };
    
    loadUser();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          // Recharger l'utilisateur à chaque changement
          const currentUser = await getLoggedInUser();
          if (currentUser) {
            setUser(currentUser);
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

  // Mise à jour quand la route change, pour s'assurer d'avoir les données à jour
  useEffect(() => {
    const checkUserState = async () => {
      // Forcer la mise à jour des données utilisateur à chaque changement de page
      const currentUser = await getLoggedInUser();
      
      // Si le localStorage a un utilisateur mais pas Supabase, nettoyer le localStorage
      if (!currentUser && localStorage.getItem("dadvisor_user")) {
        localStorage.removeItem("dadvisor_user");
        setUser(null);
      } else if (currentUser) {
        // Toujours utiliser les données les plus récentes de Supabase
        setUser(currentUser);
      }
    };
    
    checkUserState();
  }, [location.pathname]);

  const handleAccountManagement = () => {
    navigate("/account");
  };

  // Ne pas afficher la navbar sur la page d'authentification
  if (location.pathname === '/auth') {
    return null;
  }

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
