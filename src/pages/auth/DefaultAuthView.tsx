
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { loginSchema, signupSchema } from "@/hooks/use-auth-form";
import { z } from "zod";

interface DefaultAuthViewProps {
  onLoginSubmit: (values: z.infer<typeof loginSchema>) => Promise<void>;
  onSignupSubmit: (values: z.infer<typeof signupSchema>) => Promise<void>;
  onResetPassword: () => void;
  onGoogleLogin: () => Promise<void>;
  onLinkedInLogin: () => Promise<void>;
  isLoading: {
    google: boolean;
    linkedin: boolean;
    email: boolean;
  };
  authError: string | null;
}

export const DefaultAuthView = ({
  onLoginSubmit,
  onSignupSubmit,
  onResetPassword,
  onGoogleLogin, 
  onLinkedInLogin,
  isLoading,
  authError
}: DefaultAuthViewProps) => {
  return (
    <AuthLayout
      title="DADVISOR"
      description="Connectez-vous pour accéder à votre espace personnel"
      showHomeButton
    >
      <AuthTabs
        onLoginSubmit={onLoginSubmit}
        onSignupSubmit={onSignupSubmit}
        onResetPassword={onResetPassword}
        onGoogleLogin={onGoogleLogin}
        onLinkedInLogin={onLinkedInLogin}
        isLoading={isLoading}
        authError={authError}
      />
    </AuthLayout>
  );
};
