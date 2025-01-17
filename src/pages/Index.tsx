import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { MemecoinsTable } from "@/components/MemecoinsTable";
import { FirecrawlService } from "@/services/FirecrawlService";
import { Memecoin } from "@/types/memecoin";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [coins, setCoins] = useState<Memecoin[]>([]);

  const handleScrape = async () => {
    setIsLoading(true);
    try {
      const result = await FirecrawlService.crawlPumpFun();
      
      if (result.success && result.data) {
        // Process the scraped data here
        // This is a mock implementation - you'll need to adjust based on actual data structure
        const processedCoins: Memecoin[] = [
          {
            name: "Sample Coin",
            symbol: "SAMPLE",
            marketCap: 15000,
            threadUrl: "https://pump.fun/thread/123",
            threadComments: 150,
            dexStatus: "paid",
            graduated: false,
            socialScore: 85,
            meta: ["pepe", "wojak"],
          },
          // Add more mock data as needed
        ];
        
        setCoins(processedCoins);
        toast({
          title: "Success",
          description: "Successfully scraped pump.fun",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to scrape data",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <div className="container py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
            Memecoin Scanner
          </h1>
          <p className="text-muted-foreground">
            Find promising memecoins with high social engagement and low market cap
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="gradient-border">
            <div className="p-6 space-y-6">
              <ApiKeyForm />
              <Button
                onClick={handleScrape}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
              >
                {isLoading ? "Scanning..." : "Scan pump.fun"}
              </Button>
            </div>
          </div>
        </div>

        {coins.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Results</h2>
            <MemecoinsTable coins={coins} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;