
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Interface pour les propriétés du composant FeatureCard
 * @param icon - Icône représentant la fonctionnalité
 * @param title - Titre de la fonctionnalité
 * @param description - Description détaillée de la fonctionnalité
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/**
 * Composant FeatureCard - Carte présentant une fonctionnalité de l'application
 * Affiche une icône, un titre et une description avec des animations au défilement
 */
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px 0px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
    >
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      
      <h3 className="text-xl font-medium mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;
