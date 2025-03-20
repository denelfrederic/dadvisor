
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Home, Send, Mail, X } from "lucide-react";
import Navbar from "@/components/Navbar";

type IssueType = 'bug' | 'feature' | 'question' | 'other';

/**
 * Page Contact - Permet aux utilisateurs de signaler des problèmes ou de faire des retours
 */
const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simuler l'envoi (à remplacer par un vrai envoi de formulaire)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser le formulaire
      setName('');
      setEmail('');
      setIssueType('bug');
      setMessage('');
      
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dès que possible.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur lors de l'envoi",
        description: "Veuillez réessayer plus tard ou nous contacter directement par email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Coordonnées et informations de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Nous contacter</CardTitle>
                <CardDescription>Plusieurs façons de nous joindre</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-dadvisor-blue mt-0.5" />
                  <div>
                    <p className="font-medium">Email direct</p>
                    <a 
                      href="mailto:frederic.denel@dadvisor.ai" 
                      className="text-dadvisor-blue hover:underline"
                    >
                      frederic.denel@dadvisor.ai
                    </a>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-800 mt-6">
                  <p className="font-medium mb-1">Version Alpha</p>
                  <p>
                    DADVISOR est actuellement en version alpha. Votre retour est précieux 
                    pour nous aider à améliorer notre plateforme.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Formulaire de contact */}
            <Card>
              <CardHeader>
                <CardTitle>Signaler un problème</CardTitle>
                <CardDescription>
                  Décrivez votre problème ou suggestion
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="issue-type">Type de problème</Label>
                    <Select 
                      value={issueType} 
                      onValueChange={value => setIssueType(value as IssueType)}
                    >
                      <SelectTrigger id="issue-type">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug / Erreur</SelectItem>
                        <SelectItem value="feature">Suggestion de fonctionnalité</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      value={message} 
                      onChange={e => setMessage(e.target.value)} 
                      placeholder="Décrivez votre problème ou suggestion en détail..."
                      rows={5}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
