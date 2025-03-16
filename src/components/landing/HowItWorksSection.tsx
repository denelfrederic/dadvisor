
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
          eyebrow="Notre méthode"
          title="Comment DADVISOR vous accompagne"
          description="Un parcours simple pour découvrir votre profil d'investisseur et accéder à des portefeuilles adaptés, le tout en gardant le contrôle total de vos fonds"
        />
        
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative">
            {/* Ligne verticale connectant les étapes */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted"></div>
            
            {/* Liste des étapes du processus */}
            <StepItem 
              number="1"
              title="Créez votre compte"
              description="Inscrivez-vous facilement pour commencer votre parcours de découverte d'investisseur. Aucune information bancaire n'est demandée."
            />
            
            <StepItem 
              number="2"
              title="Complétez le questionnaire"
              description="Répondez à des questions simples pour évaluer votre tolérance au risque, vos connaissances financières et vos objectifs d'investissement."
            />
            
            <StepItem 
              number="3"
              title="Découvrez votre profil"
              description="Obtenez une analyse détaillée de votre profil d'investisseur et comprenez comment il influence vos décisions financières."
            />
            
            <StepItem 
              number="4"
              title="Explorez les portefeuilles"
              description="Découvrez des portefeuilles d'investissement diversifiés incluant cryptomonnaies et actifs traditionnels, adaptés à votre profil."
            />
            
            <StepItem 
              number="5"
              title="Investissez en autonomie"
              description="Choisissez librement votre portefeuille et investissez à votre rythme. DADVISOR ne touche jamais à vos fonds - vous gardez le contrôle total à chaque étape."
              isLast={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
