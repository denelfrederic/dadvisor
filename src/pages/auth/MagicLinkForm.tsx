
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

interface MagicLinkFormProps {
  authError: string | null;
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
}

export const MagicLinkForm = ({ authError, onSubmit, onBack }: MagicLinkFormProps) => {
  return (
    <AuthLayout 
      title="J'ai oublié mon mot de passe"
      description="Cliquez ici pour recevoir un magic link"
      showBackButton
      backButtonAction={onBack}
    >
      <ResetPasswordForm
        onSubmit={onSubmit}
        authError={authError}
      />
    </AuthLayout>
  );
};
