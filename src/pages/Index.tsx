
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  const parallaxOffset = scrollY * 0.25;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 -z-10"
          style={{ 
            transform: `translateY(${parallaxOffset * 0.5}px)`,
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(238, 240, 255, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%)",
            opacity: 0.7
          }}
        ></div>
        
        <div className="container mx-auto px-4 pt-20 md:pt-0">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                Innovation Financière
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Votre avenir financier,{" "}
                <span className="text-primary">simplifié</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                DADVISOR vous accompagne dans la construction de votre portefeuille d'investissement 
                personnalisé, adapté à votre profil de risque et vos objectifs.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button size="lg" asChild>
                  <Link to="/auth">Commencer</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/questionnaire">Découvrir nos portefeuilles</Link>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative mx-auto mt-12 max-w-3xl"
            >
              <div className="glass-card overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070" 
                  alt="Interface DADVISOR" 
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              
              <div className="absolute -bottom-6 -right-6 z-10">
                <div className="neo-card p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium">+12.4%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Performance annuelle</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader 
            eyebrow="Fonctionnalités"
            title="Un parcours complet et transparent"
            description="Nous vous accompagnons à chaque étape de votre parcours d'investissement, de l'évaluation de votre profil à la gestion de votre portefeuille."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <FeatureCard 
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3247 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3247 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2447 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2447 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3247 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3247 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70331 18.6378 3.70331 18.375C3.70331 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62331 5.96783 3.62331 5.705C3.62331 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70331 5.625 3.70331C5.88783 3.70331 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62331 18.295 3.62331C18.5578 3.62331 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2447 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2447 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Profilage Intelligent"
              description="Notre questionnaire évalue votre tolérance au risque et vos connaissances pour vous orienter vers le portefeuille idéal."
            />
            
            <FeatureCard 
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Portefeuilles Adaptés"
              description="Trois portefeuilles soigneusement conçus pour différents profils d'investisseurs, de prudent à dynamique."
            />
            
            <FeatureCard 
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3H13C14.0609 3 15.0783 3.42143 15.8284 4.17157C16.5786 4.92172 17 5.93913 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              title="Wallet Décentralisé"
              description="Créez facilement un wallet Ibex pour gérer vos investissements en toute sécurité et transparence."
            />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gradient-radial">
        <div className="container mx-auto px-4">
          <SectionHeader 
            eyebrow="Processus"
            title="Comment ça fonctionne"
            description="Un parcours simple en 5 étapes pour commencer votre investissement personnalisé"
          />
          
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted"></div>
              
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
      
      {/* CTA Section */}
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
      
      {/* Footer */}
      <footer className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold">DADVISOR</div>
              <p className="text-sm text-muted-foreground mt-2">
                © 2023 DADVISOR. Tous droits réservés.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <Link to="/" className="text-sm hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link to="/questionnaire" className="text-sm hover:text-primary transition-colors">
                Questionnaire
              </Link>
              <Link to="/portfolios" className="text-sm hover:text-primary transition-colors">
                Portefeuilles
              </Link>
              <Link to="/wallet" className="text-sm hover:text-primary transition-colors">
                Wallet
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component for section headers
interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

const SectionHeader = ({ eyebrow, title, description }: SectionHeaderProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return (
    <div ref={ref} className="text-center max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
      >
        {eyebrow}
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold mb-4"
      >
        {title}
      </motion.h2>
      
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

// Component for feature cards
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

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

// Component for step items
interface StepItemProps {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}

const StepItem = ({ number, title, description, isLast = false }: StepItemProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className={`relative pl-16 ${isLast ? "" : "pb-12"}`}
    >
      <div className="absolute left-0 w-16 flex justify-center">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium z-10">
          {number}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
};

export default Index;
