
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

/**
 * En-tête de la page contact avec titre et bouton de retour
 */
const ContactHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Contact & Support</h1>
      <Button variant="outline" asChild className="flex items-center gap-2">
        <Link to="/">
          <Home size={18} />
          Accueil
        </Link>
      </Button>
    </div>
  );
};

export default ContactHeader;
