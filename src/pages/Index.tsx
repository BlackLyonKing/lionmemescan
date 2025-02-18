
import { WalletButton } from "@/components/WalletButton";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrialAccessDialog } from "@/components/TrialAccessDialog";
import { 
  CircleDollarSign, 
  ChevronDown, 
  Rocket,
  Timer,
  BarChart3,
  Wallet
} from "lucide-react";
import { webSocketService } from "@/services/WebSocketService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSection } from "@/components/TokenSection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Token {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h?: number;
  marketCap?: number;
  address?: string;
  holders?: number;
  createdAt?: Date;
}

const Index = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { publicKey } = useWallet();
  const [selectedPreset, setSelectedPreset] = useState<'S1' | 'S2' | 'S3'>('S1');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickBuyAmount, setQuickBuyAmount] = useState(0.1);

  useEffect(() => {
    if (publicKey) {
      checkAccess();
    }
  }, [publicKey]);

  const checkAccess = async () => {
    if (!publicKey) return;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select()
      .eq('wallet_address', publicKey.toString())
      .single();

    if (subscription) {
      setHasAccess(true);
      return;
    }

    const trialData = localStorage.getItem(`trialStartTime_${publicKey.toString()}`);
    if (!trialData) {
      setShowTerms(true);
    } else {
      setHasAccess(true);
    }
  };

  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    webSocketService.connect();

    const handleMessage = (data: any) => {
      console.log('Received message:', data);

      if (data.type === 'token') {
        const newToken = {
          symbol: data.data.symbol,
          name: data.data.name,
          price: parseFloat(data.data.price || '0'),
          priceChange24h: parseFloat(data.data.priceChange24h || '0'),
          volume24h: parseFloat(data.data.volume24h || '0'),
          marketCap: parseFloat(data.data.marketCap || '0'),
          address: data.data.address,
          holders: parseInt(data.data.holders || '0'),
          createdAt: new Date(data.data.createdAt || Date.now()),
        };

        setTokens(current => {
          const exists = current.find(t => t.symbol === newToken.symbol);
          if (exists) {
            return current.map(t => t.symbol === newToken.symbol ? newToken : t);
          }
          return [...current, newToken].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0)).slice(0, 100);
        });
        setIsLoading(false);
      }
    };

    webSocketService.subscribeToMessages(handleMessage);
    return () => {
      webSocketService.unsubscribeFromMessages(handleMessage);
      webSocketService.disconnect();
    };
  }, []);

  const getFilteredTokens = (type: 'new' | 'graduating' | 'graduated') => {
    const now = new Date();
    switch (type) {
      case 'new':
        return tokens.filter(t => {
          const age = now.getTime() - (t.createdAt?.getTime() || 0);
          return age < 1000 * 60 * 60; // Less than 1 hour old
        });
      case 'graduating':
        return tokens.filter(t => {
          const age = now.getTime() - (t.createdAt?.getTime() || 0);
          return age >= 1000 * 60 * 60 * 23 && age < 1000 * 60 * 60 * 24; // 23-24 hours old
        });
      case 'graduated':
        return tokens.filter(t => {
          const age = now.getTime() - (t.createdAt?.getTime() || 0);
          return age >= 1000 * 60 * 60 * 24; // More than 24 hours old
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-foreground">
      <Navigation />
      
      <div className="container mx-auto pt-24 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">MEMESCOPE</h1>
            {!publicKey && <WalletButton />}
          </div>
          
          <p className="text-sm text-gray-400">
            Customized real-time feeds of new tokens matching your selected preset filters.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>Wallet 1</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem>Wallet 1</DropdownMenuItem>
                <DropdownMenuItem>Add Wallet</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2">
            <CircleDollarSign className="h-4 w-4" />
            <Input 
              type="number"
              value={quickBuyAmount}
              onChange={(e) => setQuickBuyAmount(parseFloat(e.target.value))}
              className="w-24 bg-transparent border-none"
              step={0.1}
            />
            <span className="text-sm text-gray-400">Quick Buy</span>
          </div>

          <div className="flex items-center gap-2">
            {['S1', 'S2', 'S3'].map((preset) => (
              <Button
                key={preset}
                variant={selectedPreset === preset ? "default" : "outline"}
                onClick={() => setSelectedPreset(preset as 'S1' | 'S2' | 'S3')}
                size="sm"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TokenSection
            title="NEWLY CREATED"
            icon={<Rocket className="h-5 w-5" />}
            iconColor="text-blue-400"
            tokens={getFilteredTokens('new')}
            isLoading={isLoading}
          />
          <TokenSection
            title="ABOUT TO GRADUATE"
            icon={<Timer className="h-5 w-5" />}
            iconColor="text-yellow-400"
            tokens={getFilteredTokens('graduating')}
            isLoading={isLoading}
          />
          <TokenSection
            title="GRADUATED"
            icon={<BarChart3 className="h-5 w-5" />}
            iconColor="text-green-400"
            tokens={getFilteredTokens('graduated')}
            isLoading={isLoading}
          />
        </div>

        <TrialAccessDialog 
          open={showTerms} 
          onOpenChange={setShowTerms}
          onAccessGranted={() => setHasAccess(true)}
        />
      </div>
    </div>
  );
};

export default Index;
