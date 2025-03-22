
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2 } from "lucide-react";
import { useCombinedSearch } from "@/hooks/use-combined-search";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";

/**
 * Page Agent IA - Version simplifiée qui interroge directement Frédéric (Agent DADVISOR)
 */
const AgentIA = () => {
  const [query, setQuery] = useState("");
  const { response, isSearching, handleSearch } = useCombinedSearch();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-36 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* En-tête de la page */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Frédéric, votre conseiller DADVISOR
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Posez vos questions sur DADVISOR et les investissements thématiques
            </p>
          </div>
          
          {/* Formulaire de recherche simplifié */}
          <Card className="mb-8 shadow-md">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Posez votre question à Frédéric..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow"
                  disabled={isSearching}
                />
                <Button 
                  type="submit" 
                  disabled={isSearching || !query.trim()}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recherche...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="mr-2 h-4 w-4" />
                      Demander
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Résultats de recherche */}
          {(isSearching || response) && (
            <Card className="shadow-md">
              <CardContent className="pt-6">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground text-center">
                      Frédéric réfléchit à votre question...
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{response}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AgentIA;
