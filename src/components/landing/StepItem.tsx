
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

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

export default StepItem;
