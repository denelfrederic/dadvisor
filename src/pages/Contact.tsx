
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Home, Mail, ExternalLink, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Page Contact - Permet aux utilisateurs de contacter directement DADVISOR
 */
const Contact = () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-radial pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Contact & Support</h1>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/">
                <Home size={18} />
                Accueil
              </Link>
            </Button>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nous contacter</CardTitle>
              <CardDescription>
                Pour toute question, suggestion ou signalement de problème
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-dadvisor-blue mt-0.5" />
                <div>
                  <p className="font-medium text-lg mb-1">Email direct</p>
                  <a 
                    href="mailto:frederic.denel@dadvisor.ai" 
                    className="text-dadvisor-blue hover:underline text-xl font-semibold flex items-center gap-2"
                  >
                    frederic.denel@dadvisor.ai
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <p className="text-muted-foreground mt-2">
                    Pour un traitement plus rapide de votre demande, merci d'inclure des détails précis 
                    sur votre requête ou le problème rencontré.
                  </p>
                </div>
              </div>
              
              <Alert className="mt-6 bg-blue-50 border-blue-200">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-800">Délai de réponse</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Nous nous efforçons de répondre à tous les messages dans un délai de 48 heures ouvrées.
                </AlertDescription>
              </Alert>
              
              <div className="p-4 bg-dadvisor-lightblue/20 rounded-md border border-dadvisor-blue/30 text-sm text-blue-800 mt-2">
                <p className="font-medium mb-1">Version Alpha</p>
                <p>
                  DADVISOR est actuellement en version alpha. Votre retour est précieux 
                  pour nous aider à améliorer notre plateforme.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Questions fréquentes</CardTitle>
              <CardDescription>
                Consultez nos réponses aux questions les plus courantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-medium mb-1">Comment réinitialiser mon mot de passe ?</h3>
                <p className="text-sm text-muted-foreground">
                  Utilisez l'option "Mot de passe oublié" sur la page de connexion pour recevoir 
                  un lien de réinitialisation par email.
                </p>
              </div>
              
              <div className="border-b pb-3">
                <h3 className="font-medium mb-1">Mon profil d'investisseur est-il sauvegardé ?</h3>
                <p className="text-sm text-muted-foreground">
                  Oui, votre profil et vos réponses au questionnaire sont automatiquement sauvegardés 
                  lorsque vous êtes connecté à votre compte.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Comment mettre à jour mes informations ?</h3>
                <p className="text-sm text-muted-foreground">
                  Vous pouvez modifier vos informations personnelles et vos préférences dans la 
                  section "Compte" accessible depuis le menu de navigation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Contact;
