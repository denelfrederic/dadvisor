
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
        <Link to="/" className="text-2xl font-bold">
          DADVISOR
        </Link>
        
        <div className="hidden md:flex space-x-6 items-center">
          <NavLink to="/" label="Accueil" currentPath={location.pathname} />
          <NavLink to="/questionnaire" label="Questionnaire" currentPath={location.pathname} />
          <NavLink to="/portfolios" label="Portefeuilles" currentPath={location.pathname} />
          <NavLink to="/wallet" label="Wallet" currentPath={location.pathname} />
          <Button asChild className="ml-4">
            <Link to="/auth">Connexion</Link>
          </Button>
        </div>
        
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

interface NavLinkProps {
  to: string;
  label: string;
  currentPath: string;
}

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
