
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent, CardFooter } from "@/components/ui/card";
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
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground/30"></span>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">ou continuer avec</span>
          </div>
        </div>
        
        <SocialLoginButtons 
          onGoogleLogin={onGoogleLogin}
          onLinkedInLogin={onLinkedInLogin}
          isLoading={{
            google: isLoading.google,
            linkedin: isLoading.linkedin
          }}
        />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          En vous connectant, vous acceptez nos{" "}
          <a href="#" className="underline hover:text-primary">
            conditions d'utilisation
          </a>{" "}
          et notre{" "}
          <a href="#" className="underline hover:text-primary">
            politique de confidentialité
          </a>
          .
        </div>
      </CardFooter>
    </>
  );
};
