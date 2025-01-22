import { Navigation } from "@/components/Navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { UserProfile } from "@/components/UserProfile";
import { useEffect } from "react";

const Profile = () => {
  const { publicKey, connecting } = useWallet();

  useEffect(() => {
    console.log("Profile page mounted");
    console.log("Wallet status:", { publicKey: publicKey?.toString(), connecting });
  }, [publicKey, connecting]);

  if (connecting) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="animate-pulse">
            <h1 className="text-2xl mb-4">Connecting to wallet...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-2xl mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8">Please connect your wallet to view your profile</p>
          <WalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
          Your Profile
        </h1>
        <UserProfile />
      </div>
    </div>
  );
};

export default Profile;