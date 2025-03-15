
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Interface pour les propriétés du composant SectionHeader
 * @param eyebrow - Texte court affiché au-dessus du titre principal
 * @param title - Titre principal de la section
 * @param description - Description détaillée de la section
 */
interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

/**
 * Composant SectionHeader - En-tête utilisé pour les sections de la page d'accueil
 * Affiche un titre, un texte court au-dessus et une description avec des animations
 * Utilise useInView pour déclencher les animations au défilement
 */
const SectionHeader = ({ eyebrow, title, description }: SectionHeaderProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return (
    <div ref={ref} className="text-center max-w-3xl mx-auto">
      {/* Texte court avec animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
      >
        {eyebrow}
      </motion.div>
      
      {/* Titre principal avec animation */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold mb-4"
      >
        {title}
      </motion.h2>
      
      {/* Description avec animation */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg text-muted-foreground"
      >
        {description}
      </motion.p>
    </div>
  );
};

export default SectionHeader;
