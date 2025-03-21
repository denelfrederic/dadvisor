
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User, getLoggedInUser } from "@/utils/auth";
import { useNavbarScroll } from "@/hooks/use-navbar-scroll";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { NavLink } from "@/components/navbar/NavLink";
import { Menu } from "lucide-react";
import MobileMenu from "@/components/navbar/MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Composant Navbar - Barre de navigation principale de l'application
 * Change d'apparence lors du défilement et met en évidence le lien actif
 */
const Navbar = () => {
  const { scrolled } = useNavbarScroll();
  const { user, setUser } = useAuthStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Mise à jour quand la route change, pour s'assurer d'avoir les données à jour
  useEffect(() => {
    const checkUserState = async () => {
      // Forcer la mise à jour des données utilisateur à chaque changement de page
      const currentUser = await getLoggedInUser();
      
      // Si le localStorage a un utilisateur mais pas Supabase, nettoyer le localStorage
      if (!currentUser && localStorage.getItem("user")) {
        localStorage.removeItem("user");
        setUser(null);
      } else if (currentUser) {
        // Toujours utiliser les données les plus récentes de Supabase
        setUser(currentUser);
      }
    };
    
    checkUserState();
  }, [location.pathname, setUser]);

  const handleAccountManagement = () => {
    navigate("/account");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
          ? "bg-white/80 backdrop-blur-md shadow-sm py-2" 
          : "bg-transparent py-3"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/8c04feb5-4e71-478f-9b9d-105fbaba9a69.png" 
            alt="DADVISOR" 
            className="h-12 md:h-16 lg:h-20"
          />
        </Link>
        
        {/* Liens de navigation - version desktop */}
        <div className="hidden md:flex space-x-4 lg:space-x-6 items-center">
          <NavLink to="/" label="Accueil" currentPath={location.pathname} />
          <NavLink to="/questionnaire" label="Questionnaire" currentPath={location.pathname} />
          <NavLink to="/portfolios" label="Portefeuilles" currentPath={location.pathname} />
          <NavLink to="/wallet" label={<span className="whitespace-nowrap">Mon coffre</span>} currentPath={location.pathname} />
          <NavLink to="/contact" label="Contact" currentPath={location.pathname} />
          
          {user ? (
            <Button 
              variant="outline" 
              className="ml-2 hover:bg-dadvisor-lightblue text-xs lg:text-sm whitespace-nowrap min-w-[150px] px-4" 
              onClick={handleAccountManagement}
              title={user.email || user.name}
            >
              {user.email ? 
                (user.email.length > 15 ? user.email.substring(0, 12) + '...' : user.email) : 
                (user.name.length > 15 ? user.name.substring(0, 12) + '...' : user.name)
              }
            </Button>
          ) : (
            <Button 
              asChild 
              className="ml-2 whitespace-nowrap min-w-[120px] px-4"
            >
              <Link to="/auth">Connexion</Link>
            </Button>
          )}
        </div>
        
        {/* Bouton de menu - version mobile */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Menu mobile */}
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          currentPath={location.pathname}
          user={user}
          onAccountClick={handleAccountManagement}
        />
      </div>
    </motion.nav>
  );
};

export default Navbar;
