
import { AnimatePresence, motion } from "framer-motion";
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
      <SheetContent side="right" className="px-0">
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex flex-col space-y-4 px-6 py-4">
            <NavLink to="/" label="Accueil" currentPath={currentPath} onClick={onClose} />
            <NavLink to="/questionnaire" label="Questionnaire" currentPath={currentPath} onClick={onClose} />
            <NavLink to="/portfolios" label="Portefeuilles" currentPath={currentPath} onClick={onClose} />
            <NavLink to="/wallet" label="Wallet" currentPath={currentPath} onClick={onClose} />
            {/* Suppression du lien Administration IA */}
          </div>
          
          <div className="mt-auto px-6 pb-8 pt-4">
            {user ? (
              <Button 
                variant="outline" 
                className="w-full hover:bg-dadvisor-lightblue" 
                onClick={() => {
                  onAccountClick();
                  onClose();
                }}
              >
                Connecté comme "{user.email}"
              </Button>
            ) : (
              <Button asChild className="w-full" onClick={onClose}>
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
