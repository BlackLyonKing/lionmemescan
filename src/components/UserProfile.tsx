import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bell, History } from "lucide-react";

interface Transaction {
  date: string;
  type: string;
  amount: string;
  symbol: string; // Changed from token to symbol to match the usage
}

export const UserProfile = () => {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [transactions] = useState<Transaction[]>([
    { date: "2024-02-20", type: "Purchase", amount: "0.5 SOL", symbol: "MEME1" },
    { date: "2024-02-19", type: "Sale", amount: "0.3 SOL", symbol: "MEME2" },
  ]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting email:", email);
    
    try {
      // This would be replaced with actual Supabase integration
      toast({
        title: "Email preferences updated",
        description: "You will receive alerts for trending memecoins",
      });
    } catch (error) {
      console.error("Error updating email preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update email preferences",
        variant: "destructive",
      });
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Please connect your wallet to view your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-crypto-purple" />
            <h2 className="text-xl font-bold">Email Alerts</h2>
          </div>
          
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-md"
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90"
              >
                Save
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
              <span>Receive alerts for trending memecoins</span>
            </div>
          </form>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-crypto-purple" />
            <h2 className="text-xl font-bold">Transaction History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Token</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{tx.date}</td>
                    <td className="py-2">{tx.type}</td>
                    <td className="py-2">{tx.amount}</td>
                    <td className="py-2">{tx.symbol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};