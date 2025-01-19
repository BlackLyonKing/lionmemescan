import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { MemecoinsTable } from "@/components/MemecoinsTable";
import { FirecrawlService } from "@/services/FirecrawlService";
import { Memecoin } from "@/types/memecoin";
import { Navigation } from "@/components/Navigation";
import { WalletButton } from "@/components/WalletButton";
import { PaymentGate } from "@/components/PaymentGate";
import { useWallet } from "@solana/wallet-adapter-react";
import { SolanaPrice } from "@/components/SolanaPrice";
import TrendingBanner from "@/components/TrendingBanner";

const Index = () => {
  const { toast } = useToast();
  const { connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [coins, setCoins] = useState<Memecoin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasPaidAccess, setHasPaidAccess] = useState(() => {
    return localStorage.getItem("botAccessPaid") === "true";
  });

  const handlePaymentSuccess = () => {
    setHasPaidAccess(true);
  };

  const handleScan = async () => {
    setIsLoading(true);
    try {
      const result = await FirecrawlService.crawlPumpFun();
      
      if (result.success) {
        const processedCoins: Memecoin[] = result.data.map(coin => ({
          name: coin.name,
          symbol: coin.symbol,
          marketCap: coin.marketCap,
          threadUrl: coin.threadUrl,
          threadComments: coin.threadComments,
          dexStatus: coin.dexStatus as "paid" | "unpaid",
          graduated: coin.graduated,
          socialScore: coin.socialScore,
          meta: coin.meta,
          bundledBuys: coin.bundledBuys,
          creatorRisk: {
            previousScams: coin.creatorRisk.previousScams,
            riskLevel: coin.creatorRisk.riskLevel as "low" | "medium" | "high",
            lastScamDate: coin.creatorRisk.lastScamDate
          }
        }));
        
        setCoins(processedCoins);
        toast({
          title: "Success",
          description: "Successfully scraped pump.fun",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to scrape data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scraping data:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a contract address or name to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Searching pump.fun for:", searchQuery);
      const result = await FirecrawlService.crawlPumpFun();
      
      if (result.success) {
        const processedCoins: Memecoin[] = result.data.map(coin => ({
          name: coin.name,
          symbol: coin.symbol,
          marketCap: coin.marketCap,
          threadUrl: coin.threadUrl,
          threadComments: coin.threadComments,
          dexStatus: coin.dexStatus as "paid" | "unpaid",
          graduated: coin.graduated,
          socialScore: coin.socialScore,
          meta: coin.meta,
          bundledBuys: coin.bundledBuys,
          creatorRisk: {
            previousScams: coin.creatorRisk.previousScams,
            riskLevel: coin.creatorRisk.riskLevel as "low" | "medium" | "high",
            lastScamDate: coin.creatorRisk.lastScamDate
          }
        }));
        
        setCoins(processedCoins);
        toast({
          title: "Success",
          description: "Successfully searched pump.fun",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to search data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching data:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (!connected) {
      return (
        <div className="text-center p-6">
          <p className="text-muted-foreground">Please connect your wallet to access the bot</p>
        </div>
      );
    }

    if (!hasPaidAccess) {
      return <PaymentGate onPaymentSuccess={handlePaymentSuccess} />;
    }

    return (
      <>
        <div className="space-y-6">
          <TrendingBanner />
          <div className="max-w-md mx-auto">
            <div className="gradient-border">
              <div className="p-6 space-y-6">
                <ApiKeyForm />
                <Button
                  onClick={handleScan}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
                >
                  {isLoading ? "Scanning..." : "Scan pump.fun"}
                </Button>
                
                <div className="pt-4 border-t border-white/10">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Search for specific coins:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter contract address or name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        {isLoading ? "Searching..." : "Search"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {coins.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Results</h2>
            <MemecoinsTable coins={coins} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <Navigation />
      <WalletButton />
      <div className="fixed top-4 left-4 z-50">
        <SolanaPrice />
      </div>
      <div className="container py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
            Memecoin Scanner
          </h1>
          <p className="text-muted-foreground">
            Find promising memecoins with high social engagement and low market cap
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Index;