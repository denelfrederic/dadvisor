
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, updatePassword, getLoggedInUser } from "@/utils/auth";

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fonction pour forcer la mise à jour des données utilisateur
  const refreshUserData = async () => {
    const currentUser = await getLoggedInUser();
    if (currentUser) {
      setUser(currentUser);
      setEmail(currentUser.email);
    } else {
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate("/auth");
    }
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    refreshUserData();
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    setLoading(true);
    
    try {
      await updatePassword(password);
      toast.success("Mot de passe mis à jour avec succès");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du mot de passe");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || email === user?.email) {
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error("Adresse email invalide");
      return;
    }
    
    setEmailLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;
      
      // Forcer la mise à jour des données utilisateur après changement d'email
      await refreshUserData();
      
      toast.success("Demande de mise à jour d'email envoyée. Veuillez vérifier votre boîte mail pour confirmer.");
    } catch (error: any) {
      // Si l'erreur est liée à un domaine invalide (comme .air au lieu de .ai)
      if (error.message && error.message.includes("invalid")) {
        toast.error("Adresse email invalide. Vérifiez le format et le domaine de votre email.");
      } else {
        toast.error(error.message || "Erreur lors de la mise à jour de l'email");
      }
      console.error(error);
      
      // Restaurer l'email d'origine en cas d'échec
      if (user) {
        setEmail(user.email);
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("dadvisor_user");
      navigate("/");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-dadvisor-navy mb-8">Gestion de compte</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Mettez à jour votre adresse email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={emailLoading}
              />
            </div>
            <Button type="submit" disabled={emailLoading || email === user?.email}>
              {emailLoading ? "Mise à jour..." : "Mettre à jour l'email"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Reste du composant */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>Mettez à jour votre mot de passe</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button type="submit" disabled={loading || !password || !confirmPassword}>
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Separator className="my-8" />
      
      <div className="flex justify-center">
        <Button variant="destructive" onClick={handleLogout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export default Account;
