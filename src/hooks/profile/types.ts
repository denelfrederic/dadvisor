
import { InvestorProfileAnalysis } from "@/utils/questionnaire";

/**
 * Interface pour les données de profil d'investisseur
 */
export interface ProfileData {
  score: number;
  profileType: string;
  analysis: InvestorProfileAnalysis;
  investmentStyleInsights: string[];
}

/**
 * Résultat de la vérification de profil
 */
export interface ProfileCheckResult {
  loading: boolean;
  profileData: ProfileData | null;
  hasTempData: boolean;
  saveProfile: () => Promise<void>;
  handleRetakeQuestionnaire: () => void;
}

/**
 * Paramètres pour charger les données de profil
 */
export interface LoadProfileParams {
  userId: string | null;
  navigate: (path: string) => void;
  setProfileData: (data: ProfileData | null) => void;
  setLoading: (loading: boolean) => void;
}
