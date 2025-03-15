
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, getLoggedInUser } from "@/utils/auth";
import EmailUpdateForm from "@/components/account/EmailUpdateForm";
import PasswordUpdateForm from "@/components/account/PasswordUpdateForm";
import LogoutButton from "@/components/account/LogoutButton";

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // Fonction pour forcer la mise à jour des données utilisateur
  const refreshUserData = async () => {
    const currentUser = await getLoggedInUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate("/auth");
    }
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    refreshUserData();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-dadvisor-navy mb-8">Gestion de compte</h1>
      
      <EmailUpdateForm user={user} refreshUserData={refreshUserData} />
      
      <PasswordUpdateForm />
      
      <Separator className="my-8" />
      
      <LogoutButton />
    </div>
  );
};

export default Account;
