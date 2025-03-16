
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backButtonAction?: () => void;
  showHomeButton?: boolean;
}

export const AuthLayout = ({
  children,
  title,
  description,
  showBackButton = false,
  backButtonAction,
  showHomeButton = false,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      {showBackButton && (
        <Button 
          variant="outline" 
          className="absolute top-6 left-6 flex items-center gap-2"
          onClick={backButtonAction}
        >
          <ArrowLeft size={18} />
          Retour
        </Button>
      )}
      
      {showHomeButton && (
        <div className="fixed top-6 left-6 z-50">
          <Button 
            variant="outline" 
            asChild 
            className="flex items-center gap-2"
          >
            <Link to="/">
              <Home size={18} />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mt-20"
      >
        <Card className="glass-card border-none shadow-lg">
          {(title || description) && (
            <div className="space-y-1 p-6 pb-0">
              {title && <h2 className="text-2xl font-bold text-center">{title}</h2>}
              {description && <p className="text-center text-muted-foreground">{description}</p>}
            </div>
          )}
          {children}
        </Card>
      </motion.div>
    </div>
  );
};
