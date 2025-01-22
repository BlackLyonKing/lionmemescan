import { Navigation } from "@/components/Navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { UserProfile } from "@/components/UserProfile";

const Profile = () => {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-2xl mb-4">Please connect your wallet to view your profile</h1>
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