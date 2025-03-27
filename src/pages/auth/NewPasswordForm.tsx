
import { AuthLayout } from "@/components/auth/AuthLayout";
import { NewPasswordForm as NewPasswordFormComponent } from "@/components/auth/NewPasswordForm";

interface NewPasswordFormProps {
  authError: string | null;
  onSubmit: (password: string) => Promise<void>;
}

export const NewPasswordFormPage = ({ authError, onSubmit }: NewPasswordFormProps) => {
  return (
    <AuthLayout
      title="Nouveau mot de passe"
      description="Veuillez créer un nouveau mot de passe pour votre compte"
    >
      <NewPasswordFormComponent
        onSubmit={onSubmit}
        authError={authError}
      />
    </AuthLayout>
  );
};
