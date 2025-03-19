
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Home } from "lucide-react";
import { checkUserProfile } from "@/utils/profile-check";
import { useToast } from "@/components/ui/use-toast";

const AdminCheck = () => {
  const [email, setEmail] = useState("frederic.denel@dadvisor.ai");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleCheckProfile = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email requis",
        description: "Veuillez saisir une adresse email"
      });
      return;
    }

    setLoading(true);
    try {
      const profileResult = await checkUserProfile(email);
      setResult(profileResult);
      
      toast({
        title: profileResult.exists ? "Profil trouvé" : "Profil non trouvé",
        description: profileResult.message,
        variant: profileResult.exists ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Une erreur est survenue: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Vérification de profil</h1>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Accueil
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vérifier un profil d'investisseur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleCheckProfile} 
                disabled={loading}
                className="md:w-auto"
              >
                {loading ? "Vérification..." : "Vérifier"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Résultat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </CardContent>
            {result.exists && (
              <CardFooter className="justify-end">
                <Button asChild variant="outline">
                  <Link to={`/profile-analysis?userId=${result.userId}`}>
                    Voir le profil
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminCheck;
