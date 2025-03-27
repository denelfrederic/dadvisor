
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { useAuthForm } from "@/hooks/use-auth-form";
import { DefaultAuthView } from "@/pages/auth/DefaultAuthView";
import { MagicLinkForm } from "@/pages/auth/MagicLinkForm";
import { NewPasswordFormPage } from "@/pages/auth/NewPasswordForm";

/**
 * Page Auth - Permet l'authentification des utilisateurs
 * Propose des options de connexion via Google, LinkedIn, et Email/Password
 */
const Auth = () => {
  // État pour les différents modes d'affichage
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthStatus();
  
  const {
    isLoading,
    authError,
    handleEmailLogin,
    handleEmailSignup,
    handleExternalLogin,
    handleSendMagicLink,
    handleUpdatePassword
  } = useAuthForm();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User already logged in, redirecting to home page:", user);
      navigate("/");
    }
  }, [user, authLoading, navigate]);
  
  // Vérifier si l'utilisateur arrive depuis un lien de réinitialisation
  useEffect(() => {
    const reset = searchParams.get('reset');
    if (reset === 'true') {
      setShowNewPasswordForm(true);
    }
  }, [searchParams]);

  // If still loading auth state, show loading indicator
  if (authLoading) {
    return <AuthLoading />;
  }

  // Formulaire d'envoi de magic link
  if (showMagicLinkForm) {
    return (
      <MagicLinkForm
        authError={authError}
        onSubmit={async (email) => {
          const success = await handleSendMagicLink(email);
          if (success) {
            setShowMagicLinkForm(false);
          }
        }}
        onBack={() => setShowMagicLinkForm(false)}
      />
    );
  }

  // Formulaire de saisie du nouveau mot de passe
  if (showNewPasswordForm) {
    return (
      <NewPasswordFormPage
        authError={authError}
        onSubmit={async (password) => {
          const success = await handleUpdatePassword(password);
          if (success) {
            setShowNewPasswordForm(false);
            navigate("/auth");
          }
        }}
      />
    );
  }

  return (
    <DefaultAuthView
      onLoginSubmit={handleEmailLogin}
      onSignupSubmit={handleEmailSignup}
      onResetPassword={() => setShowMagicLinkForm(true)}
      onGoogleLogin={() => handleExternalLogin("google")}
      onLinkedInLogin={() => handleExternalLogin("linkedin")}
      isLoading={isLoading}
      authError={authError}
    />
  );
};

export default Auth;
