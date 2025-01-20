import { Navigation } from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
          About Memecoin Scanner
        </h1>
        <div className="text-center text-xl">
          App created by Black Lion Kings Crypto
        </div>
      </div>
    </div>
  );
};

export default About;