
import React from 'react';
import Navbar from "@/components/Navbar";
import ContactHeader from "@/components/contact/ContactHeader";
import ContactSection from "@/components/contact/ContactSection";

/**
 * Page Contact - Permet aux utilisateurs de contacter directement DADVISOR
 */
const Contact = () => {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-radial pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <ContactHeader />
          <ContactSection />
        </div>
      </div>
    </>
  );
};

export default Contact;
