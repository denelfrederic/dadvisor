
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle, loginWithLinkedIn, storeUserSession, User } from "@/utils/auth";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const Auth = () => {
  const [isLoading, setIsLoading] = useState({
    google: false,
    linkedin: false
  });
  const navigate = useNavigate();

  const handleLogin = async (provider: "google" | "linkedin") => {
    try {
      // Set loading state for the specific provider
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      
      // Call the appropriate login function
      const loginFn = provider === "google" ? loginWithGoogle : loginWithLinkedIn;
      const user = await loginFn();
      
      // Store user session
      storeUserSession(user);
      
      // Show success toast
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.name} !`,
      });
      
      // Navigate to questionnaire
      navigate("/questionnaire");
    } catch (error) {
      console.error(`Erreur lors de la connexion avec ${provider}:`, error);
      
      toast({
        variant: "destructive",
        title: "Échec de connexion",
        description: "Une erreur s'est produite lors de la tentative de connexion.",
      });
    } finally {
      // Reset loading state
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">DADVISOR</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous pour accéder à votre espace personnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleLogin("google")}
                disabled={isLoading.google || isLoading.linkedin}
              >
                {isLoading.google ? (
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                )}
                {isLoading.google ? "Connexion en cours..." : "Continuer avec Google"}
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleLogin("linkedin")}
                disabled={isLoading.google || isLoading.linkedin}
              >
                {isLoading.linkedin ? (
                  <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                )}
                {isLoading.linkedin ? "Connexion en cours..." : "Continuer avec LinkedIn"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              En vous connectant, vous acceptez nos{" "}
              <a href="#" className="underline hover:text-primary">
                conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a href="#" className="underline hover:text-primary">
                politique de confidentialité
              </a>
              .
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
