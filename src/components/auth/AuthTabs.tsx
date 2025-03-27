
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { z } from "zod";

// Schema for login form validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Schema for signup form validation
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthTabsProps {
  onLoginSubmit: (values: LoginFormValues) => Promise<void>;
  onSignupSubmit: (values: SignupFormValues) => Promise<void>;
  onResetPassword: () => void;
  onGoogleLogin: () => Promise<void>;
  onLinkedInLogin: () => Promise<void>;
  isLoading: {
    email: boolean;
    google: boolean;
    linkedin: boolean;
  };
  authError: string | null;
}

export const AuthTabs = ({
  onLoginSubmit,
  onSignupSubmit,
  onResetPassword,
  onGoogleLogin,
  onLinkedInLogin,
  isLoading,
  authError,
}: AuthTabsProps) => {
  return (
    <>
      <CardContent className="space-y-4">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm 
              onSubmit={onLoginSubmit} 
              onResetPassword={onResetPassword}
              isLoading={isLoading.email}
              authError={authError}
            />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignupForm 
              onSubmit={onSignupSubmit}
              isLoading={isLoading.email}
              authError={authError}
            />
          </TabsContent>
        </Tabs>
        
        <SocialLoginButtons 
          onGoogleLogin={onGoogleLogin}
          onLinkedInLogin={onLinkedInLogin}
          isLoading={{
            google: isLoading.google,
            linkedin: isLoading.linkedin
          }}
        />
      </CardContent>
    </>
  );
};
