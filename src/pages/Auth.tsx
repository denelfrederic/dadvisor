import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { storeUserSession } from "@/utils/auth";
import { z } from "zod";

// Import components
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

// Schema for validation
const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  confirmPassword: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

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
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading, setUser } = useAuthStatus();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User already logged in, redirecting to home page:", user);
      navigate("/");
    }
  }, [user, authLoading, navigate]);
  
  // Vérifier si l'utilisateur arrive depuis un lien de réinitialisation
  useEffect(() => {
    const reset = searchParams.get('reset');
    if (reset === 'true') {
      setShowNewPasswordForm(true);
    }
  }, [searchParams]);

  /**
   * Gère le processus de connexion avec email/mot de passe
   */
  const handleEmailLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      setAuthError(null);
      setIsLoading(prev => ({ ...prev, email: true }));
      
      console.log("Logging in with email:", values.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.user) {
        const user = {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || '',
          email: data.user.email || '',
          authProvider: "email" as const
        };
        
        storeUserSession(user);
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue, ${user.name} !`,
        });
        
        console.log("Login successful, redirecting to home page");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Erreur lors de la connexion avec email:", error);
      setAuthError(error.message || "Une erreur s'est produite lors de la tentative de connexion.");
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
      setAuthError(null);
      setIsLoading(prev => ({ ...prev, email: true }));
      
      console.log("Signing up with email:", values.email);
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.user) {
        const user = {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || '',
          email: data.user.email || '',
          authProvider: "email" as const
        };
        
        storeUserSession(user);
        
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès.",
        });
        
        console.log("Signup successful, redirecting to home page");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      setAuthError(error.message || "Une erreur s'est produite lors de la tentative d'inscription.");
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
      setAuthError(null);
      // Définit l'état de chargement pour le fournisseur spécifique
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      
      if (provider === "google") {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        // The user will be redirected to Google
        return;
      } else if (provider === "linkedin") {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'linkedin_oidc',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        // The user will be redirected to LinkedIn
        return;
      }
    } catch (error: any) {
      console.error(`Erreur lors de la connexion avec ${provider}:`, error);
      setAuthError(error.message || `Une erreur s'est produite lors de la connexion avec ${provider}`);
      toast({
        variant: "destructive",
        title: "Échec de connexion",
        description: error.message || "Une erreur s'est produite lors de la tentative de connexion.",
      });
    } finally {
      // Réinitialise l'état de chargement
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  /**
   * Gère l'envoi d'un magic link pour la connexion
   */
  const handleResetPassword = async (email: string) => {
    try {
      setAuthError(null);
      console.log("Envoi d'un magic link à :", email);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Magic Link envoyé",
        description: "Vérifiez votre boîte mail pour vous connecter.",
      });
      setShowResetForm(false);
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du magic link:", error);
      setAuthError(error.message || "Une erreur s'est produite lors de l'envoi du magic link.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'envoi du magic link.",
      });
    }
  };

  /**
   * Gère la mise à jour du mot de passe
   */
  const handleUpdatePassword = async (password: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });
      setShowNewPasswordForm(false);
      navigate("/auth");
    } catch (error: any) {
      setAuthError(error.message || "Une erreur s'est produite lors de la mise à jour du mot de passe.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la mise à jour du mot de passe.",
      });
    }
  };

  // If still loading auth state, show loading indicator
  if (authLoading) {
    return <AuthLoading />;
  }

  // Formulaire d'envoi de magic link
  if (showResetForm) {
    return (
      <AuthLayout 
        title="Connexion par Magic Link"
        description="Cliquez ici pour recevoir un magic link"
        showBackButton
        backButtonAction={() => setShowResetForm(false)}
      >
        <ResetPasswordForm
          onSubmit={handleResetPassword}
          authError={authError}
        />
      </AuthLayout>
    );
  }

  // Formulaire de saisie du nouveau mot de passe
  if (showNewPasswordForm) {
    return (
      <AuthLayout
        title="Nouveau mot de passe"
        description="Veuillez créer un nouveau mot de passe pour votre compte"
      >
        <NewPasswordForm
          onSubmit={handleUpdatePassword}
          authError={authError}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="DADVISOR"
      description="Connectez-vous pour accéder à votre espace personnel"
      showHomeButton
    >
      <AuthTabs
        onLoginSubmit={handleEmailLogin}
        onSignupSubmit={handleEmailSignup}
        onResetPassword={() => setShowResetForm(true)}
        onGoogleLogin={() => handleLogin("google")}
        onLinkedInLogin={() => handleLogin("linkedin")}
        isLoading={isLoading}
        authError={authError}
      />
    </AuthLayout>
  );
};

export default Auth;
