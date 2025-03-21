
import React from "react";
import Feature from "./Feature";

const WalletInfo = () => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
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
  );
};

export default WalletInfo;
