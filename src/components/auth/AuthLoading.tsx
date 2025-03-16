
import { AuthLayout } from "./AuthLayout";

export const AuthLoading = () => {
  return (
    <AuthLayout>
      <div className="text-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-dadvisor-blue border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Chargement de l'authentification...</p>
      </div>
    </AuthLayout>
  );
};
