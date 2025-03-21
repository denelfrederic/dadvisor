
import React from "react";
import Feature from "./Feature";

const WalletInfo = () => {
  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p className="mb-4 font-medium text-base text-primary">
          Votre coffre numérique est votre porte d'entrée vers la finance autonome.
        </p>
        
        <p className="mb-4">
          Un portefeuille simple et gratuit qui vous permet d'auto-gérer votre argent dans le nouveau système financier décentralisé en construction, sans avoir besoin de connaissances techniques ou de payer des conseillers.
        </p>
        
        <p className="mb-6">
          Dans les années à venir, vous aurez l'opportunité de choisir la répartition de votre patrimoine entre le système bancaire traditionnel et une gestion autonome via des supports financiers innovants comme DADVISOR. Ce choix stratégique vous permettra non seulement de diversifier et protéger vos avoirs face aux risques économiques actuels, mais aussi de saisir les opportunités de croissance qu'offre cette nouvelle finance.
        </p>

        <div className="border-t border-muted pt-4">
          <p className="mb-4">
            Un coffre numérique décentralisé vous donne un contrôle total sur vos actifs numériques.
            Aucune autorité centrale ne peut bloquer votre accès ou saisir vos fonds.
          </p>
          <p className="mb-4">
            Vos clés privées sont cryptées et sécurisées par biométrie selon les 
            standards les plus élevés de l'industrie.
          </p>
          <div className="space-y-3">
            <Feature 
              title="Sécurité maximale" 
              description="Vos clés privées ne sont jamais partagées et restent sous votre contrôle exclusif."
            />
            <Feature 
              title="Transactions transparentes" 
              description="Suivez en temps réel l'état de vos transactions et votre historique."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
