
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

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

export default FeatureCard;
