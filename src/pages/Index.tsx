import { WalletButton } from "@/components/WalletButton";
import { PaymentGate } from "@/components/PaymentGate";
import { useState } from "react";
import TrendingBanner from "@/components/TrendingBanner";
import { UserProfile } from "@/components/UserProfile";
import { CrawlForm } from "@/components/CrawlForm";
import { TokenBanner } from "@/components/TokenBanner";

const Index = () => {
  const [hasAccess, setHasAccess] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 space-y-8">
        <div className="flex justify-end">
          <WalletButton />
        </div>

        <TokenBanner hasAccess={hasAccess} />

        {!hasAccess ? (
          <PaymentGate onPaymentSuccess={() => setHasAccess(true)} />
        ) : (
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