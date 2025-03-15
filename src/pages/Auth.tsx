
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { 
  loginWithGoogle, 
  loginWithLinkedIn, 
  loginWithEmail, 
  signUpWithEmail, 
  resetPassword,
  updatePassword,
  storeUserSession, 
  User 
} from "@/utils/auth";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { Home, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Page Auth - Permet l'authentification des utilisateurs
 * Propose des options de connexion via Google, LinkedIn, et Email/Password
 */
const Auth = () => {
  // État pour suivre le chargement des différentes méthodes d'authentification
  const [isLoading, setIsLoading] = useState({
    google: false,
    linkedin: false,
    email: false
  });
  
  // État pour les différents modes d'affichage
  const [showResetForm, setShowResetForm] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur arrive depuis un lien de réinitialisation
  useEffect(() => {
    const reset = searchParams.get('reset');
    if (reset === 'true') {
      setShowNewPasswordForm(true);
    }
  }, [searchParams]);

  // Schéma de validation pour le formulaire de connexion
  const loginSchema = z.object({
    email: z.string().email({ message: "Adresse email invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  });

  // Schéma de validation pour le formulaire d'inscription
  const signupSchema = z.object({
    email: z.string().email({ message: "Adresse email invalide" }),
    password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
    confirmPassword: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

  // Formulaire de connexion
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Formulaire d'inscription
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  /**
   * Gère le processus de connexion avec email/mot de passe
   */
  const handleEmailLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(prev => ({ ...prev, email: true }));
      const user = await loginWithEmail(values.email, values.password);
      storeUserSession(user);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.name} !`,
      });
      navigate("/questionnaire");
    } catch (error: any) {
      console.error("Erreur lors de la connexion avec email:", error);
      toast({
        variant: "destructive",
        title: "Échec de connexion",
        description: error.message || "Une erreur s'est produite lors de la tentative de connexion.",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  /**
   * Gère le processus d'inscription avec email/mot de passe
   */
  const handleEmailSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      setIsLoading(prev => ({ ...prev, email: true }));
      const user = await signUpWithEmail(values.email, values.password);
      storeUserSession(user);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès.",
      });
      navigate("/questionnaire");
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      toast({
        variant: "destructive",
        title: "Échec d'inscription",
        description: error.message || "Une erreur s'est produite lors de la tentative d'inscription.",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  /**
   * Gère le processus de connexion
   * @param provider - Fournisseur d'authentification ("google" ou "linkedin")
   */
  const handleLogin = async (provider: "google" | "linkedin") => {
    try {
      // Définit l'état de chargement pour le fournisseur spécifique
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      
      // Appelle la fonction de connexion appropriée
      const loginFn = provider === "google" ? loginWithGoogle : loginWithLinkedIn;
      const user = await loginFn();
      
      // Stocke la session utilisateur
      storeUserSession(user);
      
      // Affiche une notification de succès
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.name} !`,
      });
      
      // Navigue vers le questionnaire
      navigate("/questionnaire");
    } catch (error) {
      console.error(`Erreur lors de la connexion avec ${provider}:`, error);
      
      toast({
        variant: "destructive",
        title: "Échec de connexion",
        description: "Une erreur s'est produite lors de la tentative de connexion.",
      });
    } finally {
      // Réinitialise l'état de chargement
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  /**
   * Gère la demande de réinitialisation de mot de passe
   */
  const handleResetPassword = async () => {
    try {
      await resetPassword(resetEmail);
      toast({
        title: "Demande envoyée",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
      setShowResetForm(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la demande de réinitialisation.",
      });
    }
  };

  /**
   * Gère la mise à jour du mot de passe
   */
  const handleUpdatePassword = async () => {
    try {
      await updatePassword(newPassword);
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });
      setShowNewPasswordForm(false);
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la mise à jour du mot de passe.",
      });
    }
  };

  // Formulaire de réinitialisation de mot de passe
  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
        <Button 
          variant="outline" 
          className="absolute top-6 left-6 flex items-center gap-2"
          onClick={() => setShowResetForm(false)}
        >
          <ArrowLeft size={18} />
          Retour
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="glass-card border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Réinitialiser le mot de passe</CardTitle>
              <CardDescription className="text-center">
                Entrez votre adresse email pour recevoir les instructions de réinitialisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Adresse email</Label>
                <Input 
                  id="reset-email"
                  type="email" 
                  placeholder="votre.email@exemple.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleResetPassword}
              >
                Envoyer les instructions
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Formulaire de saisie du nouveau mot de passe
  if (showNewPasswordForm) {
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
              <CardTitle className="text-2xl font-bold text-center">Nouveau mot de passe</CardTitle>
              <CardDescription className="text-center">
                Veuillez créer un nouveau mot de passe pour votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input 
                  id="new-password"
                  type="password" 
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleUpdatePassword}
              >
                Mettre à jour le mot de passe
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      {/* Bouton de retour à l'accueil */}
      <Button 
        variant="outline" 
        asChild 
        className="absolute top-6 left-6 flex items-center gap-2"
      >
        <Link to="/">
          <Home size={18} />
          Retour à l'accueil
        </Link>
      </Button>
      
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
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleEmailLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="votre.email@exemple.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <div className="text-right text-sm">
                            <button 
                              type="button" 
                              className="text-dadvisor-blue hover:underline"
                              onClick={() => setShowResetForm(true)}
                            >
                              Mot de passe oublié?
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2"
                      disabled={isLoading.email}
                    >
                      {isLoading.email ? (
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <Mail size={18} />
                      )}
                      {isLoading.email ? "Connexion en cours..." : "Se connecter avec Email"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleEmailSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="votre.email@exemple.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2"
                      disabled={isLoading.email}
                    >
                      {isLoading.email ? (
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <KeyRound size={18} />
                      )}
                      {isLoading.email ? "Inscription en cours..." : "S'inscrire avec Email"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/30"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">ou continuer avec</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {/* Bouton de connexion avec Google */}
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
              
              {/* Bouton de connexion avec LinkedIn */}
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
