
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Database } from "lucide-react";
import IndexedDocumentsList from "@/components/document/IndexedDocumentsList";
import Navbar from "@/components/Navbar";

const IndexedDocuments = () => {
  // Force a re-render when the component mounts
  useEffect(() => {
    console.log("IndexedDocuments page mounted");
    // This is just to ensure the component re-renders
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-radial py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Database size={24} className="text-dadvisor-blue" />
              <h1 className="text-3xl font-bold">Documents Indexés</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild className="flex items-center gap-2">
                <Link to="/assistant_admin">
                  <Database size={18} />
                  Admin IA
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex items-center gap-2">
                <Link to="/">
                  <Home size={18} />
                  Accueil
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground text-center mb-8">
            Liste complète de tous les documents indexés dans Pinecone et disponibles pour la recherche sémantique.
          </p>
          
          <div className="border rounded-lg p-6 bg-card shadow-sm">
            <IndexedDocumentsList />
          </div>
        </div>
      </div>
    </>
  );
};

export default IndexedDocuments;
