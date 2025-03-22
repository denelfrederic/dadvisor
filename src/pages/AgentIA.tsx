
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SearchIcon, Sparkles, Bot, Info, FileText, Code, Loader2 } from "lucide-react";
import { useCombinedSearch } from "@/hooks/use-combined-search";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Page Agent IA - Permet une recherche unifiée avec RAG + Pinecone + Internet
 * Utilise toutes les sources d'information disponibles pour répondre aux questions
 */
const AgentIA = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("response");
  const { response, sources, isSearching, debugLogs, handleSearch } = useCombinedSearch();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
      setActiveTab("response");
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
          className="max-w-5xl mx-auto"
        >
          {/* En-tête de la page */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Agent IA DADVISOR
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Posez vos questions sur l'investissement et la finance. Notre agent utilise l'intelligence artificielle, notre base de connaissances et nos documents internes pour vous fournir les meilleures réponses.
            </p>
          </div>
          
          {/* Formulaire de recherche */}
          <Card className="mb-8 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Recherche Avancée
              </CardTitle>
              <CardDescription>
                Utilise l'IA, l'analyse sémantique (RAG) et la recherche vectorielle (Pinecone) pour des réponses complètes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Qu'est-ce qu'un ETF? Comment fonctionne l'assurance-vie? Avantages de l'investissement passif?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow"
                  disabled={isSearching}
                />
                <Button 
                  type="submit" 
                  disabled={isSearching || !query.trim()}
                  className="min-w-[120px]"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recherche...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="mr-2 h-4 w-4" />
                      Rechercher
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Résultats de recherche */}
          {(isSearching || response) && (
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Résultats
                </CardTitle>
                {query && (
                  <CardDescription>
                    Votre question: <span className="font-medium">{query}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground text-center">
                      Recherche en cours dans toutes les sources de données...<br/>
                      <span className="text-sm">Base de connaissances, documents internes et Internet</span>
                    </p>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="response" className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Réponse
                      </TabsTrigger>
                      <TabsTrigger value="sources" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Sources
                        {sources.length > 0 && (
                          <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {sources.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="debug" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Technique
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="response">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">{response}</div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sources">
                      {sources.length > 0 ? (
                        <div className="space-y-3">
                          {sources.map((source, index) => (
                            <div key={index} className="border rounded-md p-3 text-sm">
                              <div className="flex gap-2 items-start">
                                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                  {index + 1}
                                </span>
                                <div>{source}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                          <Info className="h-5 w-5 mr-2" />
                          Aucune source n'a été utilisée pour cette réponse.
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="debug">
                      <Card className="bg-black text-white border-0">
                        <CardContent className="p-0">
                          <ScrollArea className="h-[400px] p-4 font-mono">
                            {debugLogs.length > 0 ? (
                              <div className="space-y-1 text-xs">
                                {debugLogs.map((log, i) => (
                                  <div key={i} className="whitespace-pre-wrap">
                                    {log}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                <p>Aucun log technique disponible</p>
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
              
              {response && (
                <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
                  <div className="flex justify-between w-full items-center">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Les réponses sont générées par intelligence artificielle et peuvent contenir des imprécisions.
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setQuery("");
                        setActiveTab("response");
                      }}
                    >
                      Nouvelle recherche
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          )}
          
          {/* Explications supplémentaires */}
          {!isSearching && !response && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    IA Avancée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Utilise OpenAI GPT-4o avec un accès à Internet pour fournir des réponses complètes et actualisées sur tout sujet financier.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Base Documentaire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Consulte notre base de connaissances et nos documents internes pour des informations spécifiques à DADVISOR et ses recommandations.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Analyse Sémantique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Utilise des vecteurs sémantiques (Pinecone) pour comprendre le sens profond de votre question et trouver les informations les plus pertinentes.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AgentIA;
