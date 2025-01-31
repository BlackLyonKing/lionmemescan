import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { ScannedTokensTable } from "@/components/ScannedTokensTable";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import { useToast } from "@/hooks/use-toast";

const Scan = () => {
  const { connected } = useWallet();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      console.log('Searching for:', query);
      // TODO: Implement search functionality
      toast({
        title: "Search initiated",
        description: `Searching for ${query}...`,
        className: "bg-gradient-to-r from-crypto-purple to-crypto-cyan text-white",
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    console.log('Filter changed:', type, value);
    // TODO: Implement filter functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-16 px-4 space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
            Memecoin Scanner
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search across multiple chains and social platforms to discover trending memecoins, 
            track insider activity, and identify potential moonshots.
          </p>
        </div>

        {!connected ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to start discovering potential memecoin opportunities
            </p>
            <WalletButton />
          </div>
        ) : (
          <div className="space-y-8">
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />
            <SearchFilters onFilterChange={handleFilterChange} />
            <ScannedTokensTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;