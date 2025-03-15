
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
 * Simule une authentification Google
 * Dans une implémentation réelle, utilisera l'API OAuth de Google
 */
export const loginWithGoogle = async (): Promise<User> => {
  // Simule un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Retourne un utilisateur simulé
  return {
    id: "google-" + Math.random().toString(36).substring(2, 11),
    name: "Thomas Dupont",
    email: "thomas.dupont@example.com",
    profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
    authProvider: "google"
  };
};

/**
 * Simule une authentification LinkedIn
 * Dans une implémentation réelle, utilisera l'API OAuth de LinkedIn
 */
export const loginWithLinkedIn = async (): Promise<User> => {
  // Simule un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Retourne un utilisateur simulé
  return {
    id: "linkedin-" + Math.random().toString(36).substring(2, 11),
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    profilePicture: "https://randomuser.me/api/portraits/women/44.jpg",
    authProvider: "linkedin"
  };
};

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
    localStorage.removeItem("dadvisor_user");
    return null;
  }
};

/**
 * Stocke les informations de l'utilisateur après connexion
 */
export const storeUserSession = (user: User): void => {
  localStorage.setItem("dadvisor_user", JSON.stringify(user));
};

/**
 * Déconnecte l'utilisateur en supprimant les données de session
 */
export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem("dadvisor_user");
};
