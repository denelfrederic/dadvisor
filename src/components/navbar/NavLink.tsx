
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

/**
 * Interface pour les propriétés du composant NavLink
 * @param to - URL de destination du lien
 * @param label - Texte à afficher ou élément React
 * @param currentPath - Chemin actuel pour détecter si le lien est actif
 * @param onClick - Fonction optionnelle à exécuter lors du clic
 */
interface NavLinkProps {
  to: string;
  label: ReactNode;
  currentPath: string;
  onClick?: () => void;
}

/**
 * Composant NavLink - Lien de navigation avec indication visuelle de l'élément actif
 * Composant interne utilisé par Navbar
 */
export const NavLink = ({ to, label, currentPath, onClick }: NavLinkProps) => {
  const isActive = currentPath === to;
  
  return (
    <Link 
      to={to} 
      className={`relative group w-full flex items-center py-2 ${
        isActive ? "font-medium" : "font-normal"
      }`} 
      onClick={onClick}
    >
      <span className={`text-base md:text-sm font-medium transition-colors ${
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
