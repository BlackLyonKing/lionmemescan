
import { Navigation } from "@/components/Navigation";
import { PumpTokensTable } from "@/components/PumpTokensTable";
import { PumpTokenStats } from "@/components/PumpTokenStats";
import { TokenTrending } from "@/components/TokenTrending";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";

const PumpFun = () => {
  const { connected } = useWallet();
  const [activeView, setActiveView] = useState<'trending' | 'all'>('trending');

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-radial from-orbo-dark to-orbo-darker">
        <Navigation />
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
          <p className="text-orbo-lightGray mb-8">
            Connect your wallet to access real-time token insights and tracking
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
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              PumpFun Scanner
            </h1>
            <p className="text-orbo-lightGray max-w-2xl mx-auto">
              Track and analyze the latest tokens on PumpFun. Get real-time insights, monitor trending tokens,
              and stay ahead of the market.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveView('trending')}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeView === 'trending'
                  ? 'bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white'
                  : 'text-orbo-lightGray hover:text-white'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveView('all')}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeView === 'all'
                  ? 'bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white'
                  : 'text-orbo-lightGray hover:text-white'
              }`}
            >
              All Tokens
            </button>
          </div>

          {activeView === 'trending' ? (
            <TokenTrending />
          ) : (
            <>
              <PumpTokenStats />
              <PumpTokensTable />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PumpFun;
