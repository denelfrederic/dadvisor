
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { AuthError } from "./AuthError";
import { CardContent } from "@/components/ui/card";

interface NewPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  authError: string | null;
}

export const NewPasswordForm = ({ onSubmit, authError }: NewPasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(password);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <CardContent className="space-y-4">
      <AuthError error={authError} />
      
      <div className="space-y-2">
        <Label htmlFor="new-password">Nouveau mot de passe</Label>
        <Input 
          id="new-password"
          type="password" 
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Mise à jour en cours...
          </>
        ) : (
          "Mettre à jour le mot de passe"
        )}
      </Button>
    </CardContent>
  );
};
