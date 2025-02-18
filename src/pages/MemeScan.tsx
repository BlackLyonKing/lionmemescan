
import { Navigation } from "@/components/Navigation";
import { MoonshotTable } from "@/components/MoonshotTable";
import { MoonshotMetrics } from "@/components/MoonshotMetrics";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";

const Moonshot = () => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-radial from-orbo-dark to-orbo-darker">
        <Navigation />
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
          <p className="text-orbo-lightGray mb-8">
            Connect your wallet to access moonshot predictions and analysis
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-orbo-dark to-orbo-darker">
      <Navigation />
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Moonshot Predictions
          </h1>
          <p className="text-orbo-lightGray max-w-2xl mx-auto">
            Discover tokens with the highest potential for explosive growth. Our AI-powered analysis
            identifies the most promising opportunities in the market.
          </p>
        </div>

        <div className="space-y-8">
          <MoonshotMetrics />
          <MoonshotTable />
        </div>
      </div>
    </div>
  );
};

export default Moonshot;
