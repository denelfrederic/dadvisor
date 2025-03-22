
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Loader2, AlertCircle, Search, FileText, ExternalLink, RefreshCw, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Page d'exploration des vecteurs Pinecone
 * Permet de visualiser les documents vectorisés
 */
const PineconeExplorer = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vectors, setVectors] = useState<any[]>([]);
  const [limit, setLimit] = useState(20);
  const [activeTab, setActiveTab] = useState("documents");
  const [filter, setFilter] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Filtres pour les types de documents
  const documentTypes = [
    { id: "all", name: "Tous les types" },
    { id: "application/pdf", name: "PDF" },
    { id: "text/plain", name: "Texte" },
    { id: "text/html", name: "HTML" },
    { id: "application/json", name: "JSON" },
    { id: "other", name: "Autre" }
  ];
  
  // Fonction pour charger les vecteurs depuis Pinecone
  const loadVectors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Préparer les filtres de métadonnées si nécessaire
      let metadata_filters = null;
      
      if (filterType && filterType !== "all") {
        metadata_filters = {
          type: filterType
        };
      }
      
      // Appeler la fonction edge
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'list-vectors',
          limit,
          metadata_filters
        }
      });
      
      if (error) {
        console.error("Erreur lors de la récupération des vecteurs:", error);
        setError(`Erreur: ${error.message}`);
        toast({
          title: "Erreur",
          description: `Impossible de récupérer les vecteurs: ${error.message}`,
          variant: "destructive"
        });
        setVectors([]);
      } else if (!data.success) {
        console.error("Échec de la récupération des vecteurs:", data.error);
        setError(`Échec: ${data.error || "Erreur inconnue"}`);
        toast({
          title: "Échec",
          description: data.error || "Impossible de récupérer les vecteurs",
          variant: "destructive"
        });
        setVectors([]);
      } else {
        // Transformer les données en tableau
        const vectorsArray = data.vectors ? 
          Object.entries(data.vectors).map(([id, vector]: [string, any]) => ({
            id,
            metadata: vector.metadata || {}
          })) : [];
        
        console.log(`${vectorsArray.length} vecteurs récupérés:`, vectorsArray);
        setVectors(vectorsArray);
        
        toast({
          title: "Succès",
          description: `${vectorsArray.length} vecteurs récupérés de Pinecone`,
        });
      }
    } catch (err) {
      console.error("Exception lors de la récupération des vecteurs:", err);
      setError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Erreur",
        description: `Exception: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
      setVectors([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger les vecteurs au montage
  useEffect(() => {
    loadVectors();
  }, [limit, filterType]);
  
  // Fonction pour filtrer les vecteurs par texte
  const filteredVectors = vectors.filter(vector => {
    if (!filter) return true;
    
    const searchLower = filter.toLowerCase();
    const metadata = vector.metadata;
    
    return (
      (metadata.title && metadata.title.toLowerCase().includes(searchLower)) ||
      (metadata.text && metadata.text.toLowerCase().includes(searchLower)) ||
      (metadata.type && metadata.type.toLowerCase().includes(searchLower)) ||
      (metadata.source && metadata.source.toLowerCase().includes(searchLower))
    );
  });
  
  // Exporter les données en CSV
  const exportToCSV = () => {
    if (vectors.length === 0) return;
    
    // Créer les en-têtes CSV
    const headers = ["ID", "Titre", "Type", "Source", "Taille", "Portion indexée"];
    
    // Créer les lignes CSV
    const csvRows = [
      headers.join(","),
      ...filteredVectors.map(vector => {
        const metadata = vector.metadata;
        return [
          `"${vector.id}"`,
          `"${metadata.title || ""}"`,
          `"${metadata.type || ""}"`,
          `"${metadata.source || ""}"`,
          `"${metadata.size || ""}"`,
          `"${metadata.indexed_portion || ""}"`,
        ].join(",");
      })
    ];
    
    // Combiner en une seule chaîne CSV
    const csvString = csvRows.join("\n");
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `pinecone_vectors_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-28 pb-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Explorateur Pinecone
            </CardTitle>
            <CardDescription>
              Visualisez et filtrez les documents vectorisés dans Pinecone
            </CardDescription>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
              <TabsList>
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents vectorisés
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre, contenu..."
                    className="pl-8"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-[200px]">
                <label className="text-sm font-medium mb-1 block">Type de document</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-[150px]">
                <label className="text-sm font-medium mb-1 block">Limite</label>
                <Select value={limit.toString()} onValueChange={(val) => setLimit(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="20" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={loadVectors}
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="bg-muted/50 rounded-md p-2 text-sm flex justify-between items-center">
              <span>
                {filteredVectors.length} document{filteredVectors.length !== 1 ? 's' : ''} trouvé{filteredVectors.length !== 1 ? 's' : ''}
                {filter && ` (filtre: "${filter}")`}
              </span>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                disabled={filteredVectors.length === 0}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Exporter
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Chargement des vecteurs Pinecone...</p>
                </div>
              </div>
            ) : filteredVectors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center p-4">
                <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucun document trouvé</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {vectors.length > 0 
                    ? "Essayez de modifier vos critères de recherche."
                    : "Aucun document n'est indexé dans Pinecone ou une erreur s'est produite lors de la récupération."}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] overflow-auto">
                <div className="space-y-4">
                  {filteredVectors.map((vector) => (
                    <VectorCard key={vector.id} vector={vector} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="text-xs text-muted-foreground">
              Les documents listés sont ceux qui ont été vectorisés dans Pinecone
            </div>
          </CardFooter>
        </Card>
      </div>
      <BottomNavbar />
    </div>
  );
};

/**
 * Carte affichant les détails d'un vecteur Pinecone
 */
interface VectorCardProps {
  vector: any;
}

const VectorCard: React.FC<VectorCardProps> = ({ vector }) => {
  const metadata = vector.metadata || {};
  
  // Obtenir le type de fichier pour l'icône
  const getTypeIcon = () => {
    const type = metadata.type || "";
    
    if (type.includes("pdf")) return "📄";
    if (type.includes("text")) return "📝";
    if (type.includes("html")) return "🌐";
    if (type.includes("json")) return "📊";
    return "📁";
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getTypeIcon()}</div>
            <div>
              <h3 className="font-medium text-base line-clamp-1" title={metadata.title}>
                {metadata.title || "Document sans titre"}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {metadata.type && (
                  <Badge variant="outline" className="text-xs">
                    {metadata.type}
                  </Badge>
                )}
                {metadata.size && (
                  <Badge variant="outline" className="text-xs">
                    {parseInt(metadata.size).toLocaleString()} caractères
                  </Badge>
                )}
                {metadata.indexed_portion && (
                  <Badge variant="outline" className="text-xs">
                    {metadata.indexed_portion}% indexé
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground truncate max-w-[150px]" title={vector.id}>
            ID: {vector.id.substring(0, 8)}...
          </div>
        </div>
        
        <Separator className="my-3" />
        
        {metadata.text && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground line-clamp-3" title={metadata.text}>
              {metadata.text}
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-muted-foreground">
            Source: {metadata.source || "Inconnue"}
          </div>
          
          {/* Bouton pour afficher plus de détails serait ici */}
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
            <ExternalLink className="h-3 w-3 mr-1" />
            Détails
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PineconeExplorer;
