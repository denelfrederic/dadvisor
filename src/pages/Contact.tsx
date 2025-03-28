
import React from 'react';
import Navbar from "@/components/Navbar";
import ContactHeader from "@/components/contact/ContactHeader";
import ContactSection from "@/components/contact/ContactSection";

/**
 * Page Contact - Permet aux utilisateurs de contacter directement DADVISOR
 */
const Contact = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-32">
        <ContactHeader />
        <ContactSection />
      </div>
    </div>
  );
};

export default Contact;
