
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";

interface EmailUpdateFormProps {
  user: User | null;
  refreshUserData: () => Promise<void>;
}

const EmailUpdateForm = ({ user, refreshUserData }: EmailUpdateFormProps) => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Vérifier le format de base de l'email
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Vérifier le domaine de l'email (pour éviter les domaines comme .air)
    const domain = email.split('@')[1];
    const tld = domain.split('.').pop()?.toLowerCase();
    if (tld && ['air', 'local', 'test', 'invalid', 'example'].includes(tld)) {
      return false;
    }
    
    return true;
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError(null);
    
    if (!email || email === user?.email) {
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Format d'email invalide ou domaine non reconnu. Utilisez un domaine standard comme .com, .fr, .ai, etc.");
      return;
    }
    
    setEmailLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;
      
      // Force user data refresh after email change
      await refreshUserData();
      
      toast.success("Demande de mise à jour d'email envoyée. Veuillez vérifier votre boîte mail pour confirmer.");
      setEmailError(null);
    } catch (error: any) {
      console.error("Email update error:", error);
      
      // Handle various error cases
      if (error.message && error.message.includes("invalid")) {
        setEmailError("Email invalide. Vérifiez le format et le domaine de votre email.");
        toast.error("Format d'email invalide");
      } else if (error.message && error.message.includes("already")) {
        setEmailError("Cet email est déjà utilisé par un autre compte.");
        toast.error("Email déjà utilisé");
      } else {
        setEmailError(error.message || "Erreur lors de la mise à jour de l'email");
        toast.error("Erreur de mise à jour");
      }
      
      // Restore original email on failure
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
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null); // Clear errors when user types
              }}
              placeholder="votre@email.com"
              required
              disabled={emailLoading}
              className={emailError ? "border-red-300" : ""}
            />
            
            {emailError && (
              <div className="text-sm flex items-start gap-2 text-destructive mt-1">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{emailError}</span>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">
              Assurez-vous d'utiliser un domaine valide comme .com, .fr, .ai, etc.
            </p>
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
