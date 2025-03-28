
import Navbar from "@/components/Navbar";

/**
 * Page "Qui sommes nous" - Présentation de l'équipe et de l'entreprise
 */
const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-32">
        <h1 className="text-3xl font-bold mb-8">Qui sommes nous</h1>
        <p className="text-muted-foreground">
          Page en construction...
        </p>
      </div>
    </div>
  );
};

export default About;
