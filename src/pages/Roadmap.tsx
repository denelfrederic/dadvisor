
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";

/**
 * Page Roadmap - Présentation des étapes futures du projet
 */
const Roadmap = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-32">
        <h1 className="text-3xl font-bold mb-8">Roadmap</h1>
        <p className="text-muted-foreground">
          Page en construction...
        </p>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Roadmap;
