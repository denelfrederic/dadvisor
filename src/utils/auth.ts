
/**
 * Utilitaires pour l'authentification des utilisateurs
 * Gère les connexions via Google, LinkedIn, et Email/Password
 */

import { supabase } from "@/integrations/supabase/client";

// Type utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  authProvider: "google" | "linkedin" | "email";
}

/**
 * S'authentifie avec un email et un mot de passe via Supabase
 */
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Aucun utilisateur trouvé");
  }

  const user = {
    id: data.user.id,
    name: email.split('@')[0], // Utilise la partie avant @ comme nom
    email: data.user.email || '',
    authProvider: "email" as const
  };
  
  // Stocker l'utilisateur dans le localStorage
  storeUserSession(user);

  return user;
};

/**
 * Simule une authentification Google
 * Dans une implémentation réelle, utilisera l'API OAuth de Google
 */
export const loginWithGoogle = async (): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  
  // This function will not return a user directly as OAuth redirects the user
  return {} as User; // This is a placeholder, the real user will be set after redirect
};

/**
 * Simule une authentification LinkedIn
 * Dans une implémentation réelle, utilisera l'API OAuth de LinkedIn
 */
export const loginWithLinkedIn = async (): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  
  // This function will not return a user directly as OAuth redirects the user
  return {} as User; // This is a placeholder, the real user will be set after redirect
};

/**
 * Crée un nouveau compte avec un email et un mot de passe
 */
export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    const user = {
      id: data.user.id,
      name: email.split('@')[0], // Utilise la partie avant @ comme nom
      email: data.user.email || '',
      authProvider: "email" as const
    };
    
    // Stocker l'utilisateur dans le localStorage
    storeUserSession(user);
    
    return user;
  } else {
    throw new Error("Erreur lors de l'inscription");
  }
};

/**
 * Demande une réinitialisation du mot de passe
 */
export const resetPassword = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/auth?reset=true',
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Modifie le mot de passe de l'utilisateur
 */
export const updatePassword = async (newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Vérifie si un utilisateur est connecté via Supabase
 */
export const getLoggedInUser = async (): Promise<User | null> => {
  // Forcer l'actualisation de la session depuis Supabase
  const { data } = await supabase.auth.getSession();
  
  if (data && data.session && data.session.user) {
    console.log("Session found:", data.session.user);
    const user = {
      id: data.session.user.id,
      name: data.session.user.email?.split('@')[0] || '',
      email: data.session.user.email || '',
      authProvider: "email" as const
    };
    
    // Mettre à jour le localStorage pour garder les données synchronisées
    storeUserSession(user);
    
    return user;
  } else {
    // S'il n'y a pas de session, s'assurer que le localStorage est nettoyé
    localStorage.removeItem("user");
    localStorage.removeItem("dadvisor_user");
    return null;
  }
};

/**
 * Stocke les informations de l'utilisateur après connexion
 */
export const storeUserSession = (user: User): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

/**
 * Déconnecte l'utilisateur en supprimant les données de session
 * Méthode entièrement revue et optimisée pour une fiabilité en production
 */
export const logout = async (): Promise<void> => {
  console.log("Exécution de la fonction de déconnexion utils/auth.ts");
  
  // 1. Nettoyer TOUS les éléments de stockage local et de session connus
  const keysToRemove = [
    // Clés d'application
    'user', 
    'dadvisor_user', 
    'dadvisor_temp_answers',
    'dadvisor_temp_score',
    'dadvisor_temp_complete',
    // Clés Supabase
    'supabase.auth.token',
    'sb-zbiyxrzbqisamabxkeqg-auth-token',
    'supabase.auth.refreshToken',
    'supabase.auth.accessToken',
    'supabase.auth.expires_at'
  ];
  
  // Supprimer toutes les clés connues
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      console.log(`Clé supprimée: ${key}`);
    } catch (e) {
      console.warn(`Erreur lors de la suppression de ${key}:`, e);
    }
  });
  
  // 2. Recherche et suppression dynamique de toutes les clés potentiellement liées à l'authentification
  try {
    // Parcourir et nettoyer localStorage
    const localStorageItemsToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
          key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('auth') || 
          key.includes('token') ||
          key.includes('user') ||
          key.includes('dadvisor')
      )) {
        localStorageItemsToRemove.push(key);
      }
    }
    
    // Supprimer les éléments après l'itération pour éviter les problèmes d'index
    localStorageItemsToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`localStorage dynamique supprimé: ${key}`);
    });
    
    // Même chose pour sessionStorage
    const sessionStorageItemsToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
          key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('auth') || 
          key.includes('token') ||
          key.includes('user') ||
          key.includes('dadvisor')
      )) {
        sessionStorageItemsToRemove.push(key);
      }
    }
    
    sessionStorageItemsToRemove.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`sessionStorage dynamique supprimé: ${key}`);
    });
  } catch (e) {
    console.warn("Erreur lors de la suppression dynamique des clés:", e);
    // Continuer malgré l'erreur
  }
  
  // 3. Réinitialiser explicitement les cookies si possible
  try {
    const cookieNames = document.cookie.split(';').map(cookie => cookie.split('=')[0].trim());
    cookieNames.forEach(name => {
      if (name.includes('sb-') || name.includes('supabase') || name.includes('auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        console.log(`Cookie supprimé: ${name}`);
      }
    });
  } catch (e) {
    console.warn("Erreur lors de la suppression des cookies:", e);
  }
  
  // 4. Appeler l'API Supabase avec gestion renforcée
  try {
    // Définir un timeout plus court (1.5 secondes)
    const signOutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Timeout de l'API Supabase atteint, continuant...");
        resolve();
      }, 1500);
    });
    
    // Race entre la déconnexion et le timeout
    await Promise.race([
      signOutPromise.then(() => {
        console.log("API Supabase signOut terminée avec succès");
      }).catch(e => {
        console.warn("Erreur ignorée lors de l'appel signOut:", e);
      }),
      timeoutPromise
    ]);
  } catch (error) {
    console.error("Exception capturée lors de la déconnexion Supabase:", error);
    // Continuer malgré l'erreur
  }
  
  // 5. Nettoyage final pour s'assurer que tout est bien supprimé
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      // Ignorer les erreurs à cette étape
    }
  });
  
  console.log("Processus de déconnexion utils/auth.ts terminé avec succès");
};
