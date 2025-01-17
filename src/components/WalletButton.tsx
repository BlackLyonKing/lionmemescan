import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const WalletButton = () => {
  const { connect, disconnect, connected, publicKey } = useWallet();
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      if (connected) {
        await disconnect();
        toast({
          title: "Wallet disconnected",
          description: "Your wallet has been disconnected successfully",
        });
      } else {
        await connect();
        toast({
          title: "Wallet connected",
          description: "Your wallet has been connected successfully",
        });
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="fixed top-4 right-4 bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {connected ? `${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}` : "Connect Wallet"}
    </Button>
  );
};