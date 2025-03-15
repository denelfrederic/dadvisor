import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
interface HeroSectionProps {
  parallaxOffset: number;
}
const HeroSection = ({
  parallaxOffset
}: HeroSectionProps) => {
  return <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{
      transform: `translateY(${parallaxOffset * 0.5}px)`,
      backgroundImage: "radial-gradient(circle at 50% 50%, rgba(238, 240, 255, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%)",
      opacity: 0.7
    }}></div>
      
      <div className="container mx-auto px-4 pt-20 md:pt-0">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-center mb-8">
            <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Innovation Financière
            </motion.div>
            
            <motion.h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.3
          }}>
              Votre avenir financier,{" "}
              <span className="text-primary">simplifié</span>
            </motion.h1>
            
            <motion.p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }}>
              DADVISOR vous accompagne dans la construction de votre portefeuille d'investissement 
              personnalisé, adapté à votre profil de risque et vos objectifs.
            </motion.p>
            
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.5
          }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">Commencer</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/questionnaire">Découvrir nos portefeuilles</Link>
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }} className="relative mx-auto mt-12 max-w-sm">
            <div className="glass-card overflow-hidden rounded-2xl shadow-lg flex justify-center p-6">
              
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default HeroSection;