
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Section des questions fréquentes (FAQ)
 */
const FaqSection = () => {
  return (
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
  );
};

export default FaqSection;
