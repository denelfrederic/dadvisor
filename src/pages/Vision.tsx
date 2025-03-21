
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";

/**
 * Page Vision - Présentation de la vision et des objectifs de l'entreprise
 */
const Vision = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-32">
        <h1 className="text-3xl font-bold mb-8">Notre Vision</h1>
        <p className="text-muted-foreground">
          Page en construction...
        </p>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Vision;
