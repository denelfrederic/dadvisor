
/**
 * Composant BottomNavbar - Barre de navigation discrète en bas de page
 * Présente sur toutes les pages de l'application
 * Version simplifiée sans liens
 */
const BottomNavbar = () => {
  return (
    <div className="bg-background/80 backdrop-blur-sm border-t py-3 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4">
          {/* Copyright */}
          <div className="text-xs text-center text-muted-foreground">
            © 2025 DADVISOR. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;
