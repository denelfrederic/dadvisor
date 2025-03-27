
import { useState, useEffect } from "react";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook personnalisé qui vérifie si l'utilisateur connecté a déjà un profil d'investissement
 * 
 * @returns Un objet contenant:
 * - hasProfile: boolean indiquant si l'utilisateur a un profil
 * - isLoading: boolean indiquant si la vérification est en cours
 * - refetch: fonction pour forcer une nouvelle vérification
 */
export function useHasProfile() {
  const { user } = useAuthStatus();
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchToggle, setRefetchToggle] = useState(false);

  // Fonction pour forcer une nouvelle vérification
  const refetch = () => setRefetchToggle(prev => !prev);

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) {
        setHasProfile(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Vérification du profil pour l'utilisateur:", user.id);
        
        const { data, error } = await supabase
          .from('investment_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Erreur lors de la vérification du profil:", error);
          setHasProfile(false);
        } else {
          const profileExists = !!data;
          console.log("Profil trouvé:", profileExists);
          setHasProfile(profileExists);
        }
      } catch (error) {
        console.error("Erreur lors de la requête:", error);
        setHasProfile(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingProfile();
  }, [user, refetchToggle]);

  return { hasProfile, isLoading, refetch };
}
