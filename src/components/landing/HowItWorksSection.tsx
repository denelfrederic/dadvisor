
import SectionHeader from "./SectionHeader";
import StepItem from "./StepItem";

/**
 * Composant HowItWorksSection - Section expliquant le processus d'investissement
 * Présente les étapes à suivre sous forme d'une liste chronologique
 */
const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-gradient-radial">
      <div className="container mx-auto px-4">
        {/* En-tête de la section */}
        <SectionHeader 
          eyebrow="Processus"
          title="Comment ça fonctionne"
          description="Un parcours simple en 5 étapes pour commencer votre investissement personnalisé"
        />
        
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative">
            {/* Ligne verticale connectant les étapes */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted"></div>
            
            {/* Liste des étapes du processus */}
            <StepItem 
              number="1"
              title="Créez votre compte"
              description="Connectez-vous facilement avec Google ou LinkedIn pour commencer votre parcours d'investissement."
            />
            
            <StepItem 
              number="2"
              title="Évaluez votre profil"
              description="Répondez à notre questionnaire pour déterminer votre tolérance au risque et vos objectifs financiers."
            />
            
            <StepItem 
              number="3"
              title="Explorez les portefeuilles"
              description="Découvrez nos trois portefeuilles d'investissement adaptés à différents profils de risque."
            />
            
            <StepItem 
              number="4"
              title="Créez votre wallet"
              description="Générez un wallet décentralisé Ibex pour sécuriser et gérer vos investissements."
            />
            
            <StepItem 
              number="5"
              title="Investissez"
              description="Choisissez votre montant d'investissement et finalisez votre placement en quelques clics."
              isLast={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
