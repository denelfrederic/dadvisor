
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

interface EmailUpdateFormProps {
  user: User | null;
  refreshUserData: () => Promise<void>;
}

const EmailUpdateForm = ({ user, refreshUserData }: EmailUpdateFormProps) => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || "");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  return (
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
  );
};

export default EmailUpdateForm;
