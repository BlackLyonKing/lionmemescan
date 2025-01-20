import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { SolanaPrice } from "./SolanaPrice";

export const Navigation = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
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
            </SheetContent>
          </Sheet>
          <SolanaPrice />
        </div>
      </div>
    </div>
  );
};