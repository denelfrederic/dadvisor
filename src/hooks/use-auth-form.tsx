
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { storeUserSession } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

// Schémas de validation
export const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export const signupSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  confirmPassword: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

/**
 * Hook personnalisé pour gérer les fonctionnalités des formulaires d'authentification
 */
export function useAuthForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    google: false,
    linkedin: false,
    email: false
  });
  const [authError, setAuthError] = useState<string | null>(null);

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
   * Gère le processus de connexion avec fournisseurs externes
   */
  const handleExternalLogin = async (provider: "google" | "linkedin") => {
    try {
      setAuthError(null);
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log(`Redirection OAuth configurée vers: ${redirectUrl}`);
      
      if (provider === "google") {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        
        if (error) throw error;
        // The user will be redirected to Google
      } else if (provider === "linkedin") {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'linkedin_oidc',
          options: {
            redirectTo: redirectUrl
          }
        });
        
        if (error) throw error;
        // The user will be redirected to LinkedIn
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
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  /**
   * Gère l'envoi d'un magic link pour la connexion
   */
  const handleSendMagicLink = async (email: string) => {
    try {
      setAuthError(null);
      console.log("Envoi d'un magic link à :", email);
      
      // Détecter l'URL de production
      // Récupérer l'URL complète actuelle du navigateur
      const currentUrl = window.location.href;
      
      // Extraire le domaine et le protocole (https://example.com ou http://localhost:5173)
      const urlObject = new URL(currentUrl);
      const baseUrl = `${urlObject.protocol}//${urlObject.host}`;
      
      console.log(`URL de base pour la redirection: ${baseUrl}`);
      
      // URL de redirection pour le magic link
      const redirectUrl = `${baseUrl}/auth/callback`;
      
      console.log(`Magic link configuré pour rediriger vers: ${redirectUrl}`);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Magic Link envoyé",
        description: "Vérifiez votre boîte mail pour vous connecter.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du magic link:", error);
      setAuthError(error.message || "Une erreur s'est produite lors de l'envoi du magic link.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'envoi du magic link.",
      });
      return false;
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
      
      return true;
    } catch (error: any) {
      setAuthError(error.message || "Une erreur s'est produite lors de la mise à jour du mot de passe.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la mise à jour du mot de passe.",
      });
      return false;
    }
  };

  return {
    isLoading,
    authError,
    handleEmailLogin,
    handleEmailSignup,
    handleExternalLogin,
    handleSendMagicLink,
    handleUpdatePassword,
    setAuthError
  };
}
