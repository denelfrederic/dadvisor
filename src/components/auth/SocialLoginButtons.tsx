
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface SocialLoginButtonsProps {
  onGoogleLogin: () => Promise<void>;
  onLinkedInLogin: () => Promise<void>;
  isLoading: {
    google: boolean;
    linkedin: boolean;
  };
}

export const SocialLoginButtons = ({ 
  onGoogleLogin, 
  onLinkedInLogin, 
  isLoading 
}: SocialLoginButtonsProps) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
        <p className="font-medium mb-2">Version Alpha</p>
        <p>
          DADVISOR est actuellement en version alpha. Pour le moment, vous pouvez uniquement vous inscrire par email.
          Les connexions via Google et LinkedIn seront disponibles prochainement.
        </p>
      </div>
      
      <div className="space-y-2 mt-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          asChild
        >
          <a href="mailto:frederic.denel@dadvisor.ai">
            <Mail size={18} />
            Contacter le support
          </a>
        </Button>
      </div>
    </div>
  );
};
