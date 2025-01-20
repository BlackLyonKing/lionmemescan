import { WalletButton } from "@/components/WalletButton";
import { useState } from "react";
import TrendingBanner from "@/components/TrendingBanner";
import { UserProfile } from "@/components/UserProfile";
import { CrawlForm } from "@/components/CrawlForm";
import { TokenBanner } from "@/components/TokenBanner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";

const Index = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 space-y-8">
        <div className="flex justify-end items-center gap-4">
          <Button
            variant="outline"
            className="bg-gradient-to-r from-crypto-purple to-crypto-cyan hover:opacity-90 transition-opacity"
            onClick={() => navigate('/pricing')}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Pricing Plans
          </Button>
          <WalletButton />
        </div>

        <TokenBanner hasAccess={hasAccess} />

        {hasAccess && (
          <div className="space-y-8">
            <TrendingBanner />
            <CrawlForm />
            <UserProfile />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;