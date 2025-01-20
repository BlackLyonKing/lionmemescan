import { Navigation } from "@/components/Navigation";

const Scan = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
          Scan Memecoins
        </h1>
        <div className="text-white/80">
          Scanning functionality will be implemented here
        </div>
      </div>
    </div>
  );
};

export default Scan;