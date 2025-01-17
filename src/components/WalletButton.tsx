import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export const WalletButton = () => {
  const { connect, disconnect, connected, publicKey, wallet, select, wallets } = useWallet();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected successfully",
      });
    } catch (error) {
      console.error("Wallet disconnection error:", error);
      toast({
        title: "Disconnection error",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWalletSelect = async (walletName: string) => {
    try {
      const selectedWallet = wallets.find(w => w.adapter.name === walletName);
      if (selectedWallet) {
        select(selectedWallet.adapter.name);
        await connect();
        setOpen(false);
        toast({
          title: "Wallet connected",
          description: `Successfully connected to ${walletName}`,
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

  if (connected) {
    return (
      <Button
        onClick={handleDisconnect}
        variant="outline"
        className="fixed top-4 right-4 bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed top-4 right-4 bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className="text-center">Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.adapter.name}
              onClick={() => handleWalletSelect(wallet.adapter.name)}
              className="w-full bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
            >
              {wallet.adapter.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};