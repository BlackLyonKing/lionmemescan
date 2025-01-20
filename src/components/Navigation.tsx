import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { SolanaPrice } from "./SolanaPrice";
import { WalletButton } from "./WalletButton";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const { formattedTime, isTrialActive } = useTrialCountdown();
  const [voucherCode, setVoucherCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVoucherSubmit = () => {
    // This would typically validate with an API
    console.log("Submitting voucher code:", voucherCode);
    toast({
      title: "Voucher Code Submitted",
      description: "We're processing your voucher code.",
    });
    setVoucherCode("");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 h-20">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="space-y-4">
                <NavigationMenu>
                  <NavigationMenuList className="flex-col items-start">
                    <NavigationMenuItem>
                      <NavigationMenuLink href="/">Home</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink href="/portfolio">Portfolio</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink href="/alerts">Alerts</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink href="/scan">Scan</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink href="/profile">Profile</NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Voucher Code</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                    />
                    <Button onClick={handleVoucherSubmit}>Apply</Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-4">
            <SolanaPrice />
            {isTrialActive && (
              <Button
                onClick={() => navigate("/access")}
                className="bg-gradient-to-r from-[#ea384c] to-[#d31027] text-white hover:opacity-90 transition-all duration-300"
              >
                Upgrade Now ({formattedTime})
              </Button>
            )}
          </div>
        </div>
        <WalletButton />
      </div>
    </div>
  );
};