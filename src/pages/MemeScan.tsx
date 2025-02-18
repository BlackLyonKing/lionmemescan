
import { Navigation } from "@/components/Navigation";
import { TokenListSection } from "@/components/TokenListSection";
import { QuickBuy } from "@/components/QuickBuy";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { useEffect, useState } from "react";
import { webSocketService } from "@/services/WebSocketService";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Token {
  name: string;
  symbol: string;
  price: string;
  marketCap: string;
  volume: string;
  change: string;
  createdAt: string;
  twitter?: string;
  telegram?: string;
}

const MemeScan = () => {
  const { connected } = useWallet();
  const [newTokens, setNewTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (connected) {
      webSocketService.connect();

      const handleMessage = (message: any) => {
        if (message.type === 'token' || message.type === 'token_update') {
          setNewTokens(prev => {
            const exists = prev.some(t => t.symbol === message.data.symbol);
            if (!exists) {
              return [...prev, message.data].slice(-10); // Keep last 10 tokens
            }
            return prev.map(t => 
              t.symbol === message.data.symbol ? { ...t, ...message.data } : t
            );
          });
        }
      };

      webSocketService.subscribeToMessages(handleMessage);

      return () => {
        webSocketService.unsubscribeFromMessages(handleMessage);
        webSocketService.disconnect();
      };
    }
  }, [connected]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Navigation />
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
          <p className="text-white/60 mb-8">
            Connect your wallet to access token listings and analysis
          </p>
          <WalletButton />
        </div>
      </div>
    );
  }

  const filteredTokens = newTokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-80 space-y-6">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by token or LP contract"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            </div>
            <QuickBuy />
          </div>
          
          <div className="flex-1 space-y-8">
            <TokenListSection 
              title="Newly Created" 
              tokens={filteredTokens} 
            />
            <TokenListSection 
              title="About to Graduate" 
              tokens={[]} 
            />
            <TokenListSection 
              title="Graduated" 
              tokens={[]} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeScan;
