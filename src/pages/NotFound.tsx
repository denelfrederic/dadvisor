
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import Navbar from "@/components/Navbar";

/**
 * Page 404 - Affichée lorsqu'une route n'existe pas
 * Enregistre l'erreur dans la console et propose à l'utilisateur de retourner à l'accueil
 */
const NotFound = () => {
  const location = useLocation();

  // Enregistre l'erreur de navigation dans la console
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-dadvisor-gray pt-24">
        <div className="bg-white p-8 rounded-lg shadow-dadvisor text-center max-w-md">
          <h1 className="text-5xl font-bold mb-4 text-dadvisor-blue">404</h1>
          <p className="text-xl text-dadvisor-darkgray mb-6 font-heading">Oops! Page non trouvée</p>
          <p className="text-gray-500 mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Button asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Retourner à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
