
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Composant CTASection - Section d'appel à l'action
 * Encourage l'utilisateur à commencer le processus d'investissement
 * Affiche un message incitatif et un bouton pour démarrer
 */
const CTASection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à construire votre futur financier ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Commencez dès aujourd'hui et accédez à des portefeuilles d'investissement personnalisés
              conçus pour atteindre vos objectifs financiers.
            </p>
            
            <Button size="lg" asChild>
              <Link to="/auth">Commencer maintenant</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
