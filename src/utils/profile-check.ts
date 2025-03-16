
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a specific user has an investment profile registered
 * @param email The email address of the user to check
 * @returns Promise with the result object containing profile information if found
 */
export const checkUserProfile = async (email: string) => {
  try {
    // First, find the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        return { exists: false, message: `No user found with email: ${email}` };
      }
      throw userError;
    }
    
    // Now check if there's an investment profile for this user
    const { data: profileData, error: profileError } = await supabase
      .from('investment_profiles')
      .select('*')
      .eq('user_id', userData.id)
      .maybeSingle();
    
    if (profileError) {
      throw profileError;
    }
    
    if (!profileData) {
      return { 
        exists: false, 
        message: `User found, but no investment profile exists for ${email}`,
        userId: userData.id
      };
    }
    
    return { 
      exists: true, 
      message: `Investment profile found for ${email}`,
      profile: profileData,
      userId: userData.id
    };
  } catch (error) {
    console.error('Error checking user profile:', error);
    return { 
      exists: false, 
      message: `Error checking profile: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
