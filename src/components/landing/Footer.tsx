
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="text-2xl font-bold">DADVISOR</div>
            <p className="text-sm text-muted-foreground mt-2">
              © 2025 DADVISOR. Tous droits réservés.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <Link to="/" className="text-sm hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link to="/questionnaire" className="text-sm hover:text-primary transition-colors">
              Questionnaire
            </Link>
            <Link to="/portfolios" className="text-sm hover:text-primary transition-colors">
              Portefeuilles
            </Link>
            <Link to="/wallet" className="text-sm whitespace-nowrap hover:text-primary transition-colors">
              Mon coffre
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
