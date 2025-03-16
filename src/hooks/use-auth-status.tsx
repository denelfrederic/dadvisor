
import { useState, useEffect } from "react";
import { User, getLoggedInUser } from "@/utils/auth";

export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getLoggedInUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking user status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  return { user, isLoading, setUser };
}
