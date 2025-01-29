import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ScanForm } from "@/components/ScanForm";
import { ScannedTokensTable } from "@/components/ScannedTokensTable";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";

const Scan = () => {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
          Scan Memecoins
        </h1>

        {!connected ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to start scanning for potential memecoin opportunities
            </p>
            <WalletButton />
          </div>
        ) : (
          <div className="space-y-8">
            <ScanForm />
            <ScannedTokensTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;