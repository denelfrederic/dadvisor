
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface WalletCreationProps {
  onWalletCreated: (walletAddress: string) => void;
}

const WalletCreation = ({ onWalletCreated }: WalletCreationProps) => {
  const [activeTab, setActiveTab] = useState("create");
  const [isCreating, setIsCreating] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [importSeed, setImportSeed] = useState("");
  const [walletCreated, setWalletCreated] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  
  const handleCreateWallet = async () => {
    setIsCreating(true);
    
    // Simulate API call to create wallet
    try {
      // In real implementation, this would be an API call to Ibex
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock seed phrase
      const mockSeedPhrase = [
        "apple", "banana", "cherry", "diamond", "elephant", 
        "festival", "guitar", "holiday", "island", "jungle", 
        "kitchen", "lemon"
      ];
      
      const mockWalletAddress = "0x" + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      
      setSeedPhrase(mockSeedPhrase);
      setWalletAddress(mockWalletAddress);
      setWalletCreated(true);
    } catch (error) {
      console.error("Failed to create wallet:", error);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleImportWallet = async () => {
    setIsCreating(true);
    
    // Simulate API call to import wallet
    try {
      // In real implementation, this would be an API call to Ibex
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockWalletAddress = "0x" + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      
      setWalletAddress(mockWalletAddress);
      onWalletCreated(mockWalletAddress);
    } catch (error) {
      console.error("Failed to import wallet:", error);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleConfirmSeedPhrase = () => {
    onWalletCreated(walletAddress);
  };
  
  if (walletCreated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Votre phrase secrète</CardTitle>
            <CardDescription>
              Veuillez noter cette phrase de récupération et la conserver dans un endroit sûr. 
              Elle est la seule façon de récupérer votre wallet si vous perdez l'accès.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {seedPhrase.map((word, index) => (
                <div key={index} className="p-3 bg-secondary rounded-md border flex items-center">
                  <span className="text-muted-foreground mr-2 text-xs">{index + 1}.</span>
                  <span className="font-mono">{word}</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 p-4 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <div className="text-amber-800">
                  <p className="font-medium mb-1">Attention !</p>
                  <ul className="list-disc pl-5 text-xs space-y-1">
                    <li>Ne partagez jamais cette phrase avec qui que ce soit</li>
                    <li>Ne la stockez pas dans un fichier numérique non-protégé</li>
                    <li>Notez-la sur papier et conservez-la en lieu sûr</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleConfirmSeedPhrase}>
              J'ai sauvegardé ma phrase secrète
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Wallet Ibex</CardTitle>
          <CardDescription>
            Créez ou importez un wallet décentralisé pour gérer vos investissements en toute sécurité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="create">Créer un wallet</TabsTrigger>
              <TabsTrigger value="import">Importer un wallet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-4">
                    Un wallet décentralisé vous donne un contrôle total sur vos actifs numériques.
                    Aucune autorité centrale ne peut bloquer votre accès ou saisir vos fonds.
                  </p>
                  <div className="space-y-3">
                    <Feature 
                      title="Sécurité maximale" 
                      description="Vos clés privées ne sont jamais partagées et restent sous votre contrôle exclusif."
                    />
                    <Feature 
                      title="Compatibilité multi-chaînes" 
                      description="Compatible avec les principales blockchains et tokens du marché."
                    />
                    <Feature 
                      title="Transactions transparentes" 
                      description="Suivez en temps réel l'état de vos transactions et votre historique."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="import">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seedPhrase">Phrase de récupération</Label>
                  <textarea 
                    id="seedPhrase"
                    className="w-full min-h-[120px] p-3 rounded-md border border-input bg-transparent text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Entrez les 12 mots de votre phrase secrète, séparés par des espaces"
                    value={importSeed}
                    onChange={(e) => setImportSeed(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Entrez votre phrase de récupération de 12 mots pour restaurer l'accès à votre wallet existant.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={activeTab === "create" ? handleCreateWallet : handleImportWallet}
            disabled={isCreating || (activeTab === "import" && !importSeed)}
          >
            {isCreating ? (
              <>
                <span className="mr-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {activeTab === "create" ? "Création en cours..." : "Importation en cours..."}
              </>
            ) : (
              activeTab === "create" ? "Créer un wallet" : "Importer un wallet"
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface FeatureProps {
  title: string;
  description: string;
}

const Feature = ({ title, description }: FeatureProps) => (
  <div className="flex items-start">
    <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default WalletCreation;
