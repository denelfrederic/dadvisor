
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ExternalLink } from "lucide-react";

/**
 * Section principale avec les informations de contact
 */
const ContactSection = () => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-start gap-3">
          <Mail className="h-6 w-6 text-dadvisor-blue mt-0.5" />
          <div>
            <a 
              href="mailto:frederic.denel@dadvisor.ai" 
              className="text-dadvisor-blue hover:underline text-xl font-semibold flex items-center gap-2"
            >
              frederic.denel@dadvisor.ai
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        
        <div className="p-4 bg-dadvisor-lightblue/20 rounded-md border border-dadvisor-blue/30 text-sm text-blue-800 mt-2">
          <p className="font-medium mb-1">Version Alpha</p>
          <p>
            DADVISOR est actuellement en version alpha. Votre retour est précieux 
            pour nous aider à améliorer notre plateforme.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
