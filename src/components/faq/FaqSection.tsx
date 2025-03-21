
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Composant FaqSection - Affiche les questions et réponses de la FAQ
 */
const FaqSection = () => {
  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
          <CardDescription>
            Trouvez rapidement des réponses à vos questions sur DADVISOR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Qu'est-ce que DADVISOR ?</AccordionTrigger>
              <AccordionContent>
                DADVISOR est une plateforme financière qui vous permet de gérer votre patrimoine de façon autonome grâce à des outils d'analyse de profil d'investisseur et de solutions de gestion d'actifs numériques.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Comment fonctionne le coffre numérique ?</AccordionTrigger>
              <AccordionContent>
                Votre coffre numérique est un portefeuille décentralisé qui vous donne un contrôle total sur vos actifs numériques. Vos clés privées sont cryptées et sécurisées par biométrie selon les standards les plus élevés de l'industrie, sans qu'aucune autorité centrale ne puisse bloquer votre accès ou saisir vos fonds.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Mes données sont-elles en sécurité ?</AccordionTrigger>
              <AccordionContent>
                Oui, la sécurité est notre priorité. Vos données personnelles et financières sont protégées par des protocoles de cryptage avancés. Nous ne partageons jamais vos informations avec des tiers sans votre consentement explicite.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Comment puis-je réinitialiser mon mot de passe ?</AccordionTrigger>
              <AccordionContent>
                Sur la page de connexion, cliquez sur "Mot de passe oublié" et suivez les instructions. Un lien de réinitialisation sera envoyé à l'adresse email associée à votre compte.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Mes résultats de questionnaire sont-ils sauvegardés ?</AccordionTrigger>
              <AccordionContent>
                Oui, si vous êtes connecté à votre compte, votre profil d'investisseur et vos réponses au questionnaire sont automatiquement sauvegardés. Vous pouvez y accéder à tout moment depuis votre espace personnel.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Que faire si je rencontre un problème technique ?</AccordionTrigger>
              <AccordionContent>
                En cas de problème technique, vous pouvez contacter notre service d'assistance via la page Contact. Notre équipe s'efforcera de résoudre votre problème dans les plus brefs délais.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>Comment mettre à jour mes informations personnelles ?</AccordionTrigger>
              <AccordionContent>
                Vous pouvez modifier vos informations personnelles et vos préférences dans la section "Compte" accessible depuis le menu de navigation en haut à droite de l'écran.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vous ne trouvez pas de réponse ?</CardTitle>
          <CardDescription>
            N'hésitez pas à nous contacter directement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Notre équipe est disponible pour répondre à toutes vos questions. Contactez-nous via notre formulaire de contact ou par email.
          </p>
          <a href="/contact" className="text-primary hover:underline font-medium">
            Contactez-nous →
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaqSection;
