
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useHasProfile } from "@/hooks/use-has-profile";
import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * Composant CTASection - Section d'appel à l'action
 * Encourage l'utilisateur à commencer le processus d'investissement
 * Affiche un message incitatif et un bouton adapté en fonction du statut utilisateur
 */
const CTASection = () => {
  const { user } = useAuthStatus();
  const { hasProfile, isLoading } = useHasProfile();

  const getButtonText = () => {
    if (!user) return "Découvrir mon profil";
    if (isLoading) return "Chargement...";
    return hasProfile ? "Voir mon profil d'investisseur" : "Découvrir mon profil";
  };

  const getDestination = () => {
    if (!user) return "/auth";
    return hasProfile ? "/profile-analysis" : "/questionnaire";
  };

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
              {hasProfile && user 
                ? "Accédez à votre profil d'investisseur"
                : "Prêt à découvrir votre profil d'investisseur ?"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {hasProfile && user 
                ? "Consultez votre profil personnalisé pour voir vos recommandations d'investissement en crypto et actifs traditionnels, tout en gardant le contrôle total de vos fonds."
                : "Commencez dès aujourd'hui et découvrez comment investir dans des portefeuilles diversifiés incluant cryptomonnaies et actifs traditionnels, en gardant toujours le contrôle total de vos fonds. DADVISOR vous guide, mais c'est vous qui prenez les décisions."}
            </p>
            
            <Button 
              size="lg" 
              asChild
              disabled={isLoading}
            >
              <Link to={getDestination()}>
                {getButtonText()}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
