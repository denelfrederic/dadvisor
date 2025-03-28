
import Navbar from "@/components/Navbar";

/**
 * Page DAO - Organisation Autonome Décentralisée
 */
const Dao = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 pt-32">
        <h1 className="text-3xl font-bold mb-8">DAO</h1>
        <p className="text-muted-foreground">
          Page en construction...
        </p>
      </div>
    </div>
  );
};

export default Dao;
