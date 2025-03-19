import React, { ReactNode, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Home } from "lucide-react";
import { checkUserProfile } from "@/utils/profile-check";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthContext";

interface AdminCheckProps {
  children: ReactNode;
}

const AdminCheck: React.FC<AdminCheckProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("frederic.denel@dadvisor.ai");
  const [checkLoading, setCheckLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  // Check if user is admin (simplified version - you should implement proper role checking)
  const isAdmin = user?.email === "admin@example.com" || user?.email === "frederic.denel@dadvisor.ai";
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }
  
  if (!user || !isAdmin) {
    toast({
      variant: "destructive",
      title: "Accès refusé",
      description: "Vous n'avez pas accès à cette zone"
    });
    return <Navigate to="/" />;
  }

  const handleCheckProfile = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email requis",
        description: "Veuillez saisir une adresse email"
      });
      return;
    }

    setLoading(true);
    try {
      const profileResult = await checkUserProfile(email);
      setResult(profileResult);
      
      toast({
        title: profileResult.exists ? "Profil trouvé" : "Profil non trouvé",
        description: profileResult.message,
        variant: profileResult.exists ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Une erreur est survenue: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children}
    </>
  );
};

export default AdminCheck;
