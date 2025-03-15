
/**
 * Utilitaires pour l'authentification des utilisateurs
 * Gère les connexions via Google et LinkedIn
 */

// Type utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  authProvider: "google" | "linkedin";
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
 * Vérifie si un utilisateur est connecté en consultant le stockage local
 */
export const getLoggedInUser = (): User | null => {
  try {
    const userJson = localStorage.getItem("dadvisor_user");
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
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
export const logout = (): void => {
  localStorage.removeItem("dadvisor_user");
};
