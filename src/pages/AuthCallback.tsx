
import { AuthCallbackLoading } from "@/components/auth/AuthCallbackLoading";
import { useAuthCallback } from "@/hooks/use-auth-callback";

const AuthCallback = () => {
  const { error } = useAuthCallback();
  
  return <AuthCallbackLoading error={error} />;
};

export default AuthCallback;
