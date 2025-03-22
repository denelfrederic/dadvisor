
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NavLink } from "./NavLink";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User } from "@/utils/auth";
import { X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  user: User | null;
  onAccountClick: () => void;
}

const MobileMenu = ({ isOpen, onClose, currentPath, user, onAccountClick }: MobileMenuProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="px-0 w-[85%] max-w-[300px] sm:max-w-sm">
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer le menu">
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex flex-col space-y-6 px-6 py-4">
            <NavLink to="/" label="Accueil" currentPath={currentPath} onClick={onClose} />
            <NavLink to="/questionnaire" label="Questionnaire" currentPath={currentPath} onClick={onClose} />
            <NavLink to="/portfolios" label="Portefeuilles" currentPath={currentPath} onClick={onClose} />
            <NavLink to="/agent-ia" label="Agent IA" currentPath={currentPath} onClick={onClose} />
            <NavLink to="/wallet" label={<span className="whitespace-nowrap">Mon coffre</span>} currentPath={currentPath} onClick={onClose} />
            <NavLink to="/contact" label="Contact" currentPath={currentPath} onClick={onClose} />
          </div>
          
          <div className="mt-auto px-6 pb-8 pt-4">
            {user ? (
              <Button 
                variant="outline" 
                className="w-full hover:bg-dadvisor-lightblue whitespace-nowrap min-w-[180px]" 
                onClick={() => {
                  onAccountClick();
                  onClose();
                }}
                title={user.email || user.name}
              >
                {user.email ? 
                  (user.email.length > 20 ? user.email.substring(0, 17) + '...' : user.email) : 
                  (user.name.length > 20 ? user.name.substring(0, 17) + '...' : user.name)
                }
              </Button>
            ) : (
              <Button 
                asChild 
                className="w-full whitespace-nowrap py-2"
                onClick={onClose}
              >
                <Link to="/auth">Connexion</Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
