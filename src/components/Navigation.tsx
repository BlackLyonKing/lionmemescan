import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";

export const Navigation = () => {
  const { publicKey } = useWallet();
  const isAdmin = publicKey?.toBase58() === "4UGRoYBFRufAm7HVSSiQbwp9ETa9gFWzyQ4czwaeVAv3";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <NavigationMenu className="mt-4">
          <NavigationMenuList className="flex flex-col space-y-2">
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/scan"
              >
                Scan
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/alerts"
              >
                Alerts
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/leaderboard"
              >
                Leaderboard
              </NavigationMenuLink>
            </NavigationMenuItem>
            {publicKey && (
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                  href="/portfolio"
                >
                  Portfolio
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/profile"
              >
                Profile
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/learn"
              >
                Learn
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/about"
              >
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/contact"
              >
                Contact
              </NavigationMenuLink>
            </NavigationMenuItem>
            {isAdmin && (
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer text-crypto-purple"
                  href="/admin"
                >
                  Admin Panel
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </SheetContent>
    </Sheet>
  );
};