import { Menu, Home, Scan, Bell, Briefcase, User, Info, MessageSquare } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
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
import { Link } from "react-router-dom";

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
      <SheetContent side="left" className="w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SheetHeader>
          <SheetTitle className="bg-gradient-to-r from-crypto-purple to-crypto-cyan bg-clip-text text-transparent">
            Memecoin Scanner
          </SheetTitle>
        </SheetHeader>
        <NavigationMenu className="mt-4">
          <NavigationMenuList className="flex flex-col space-y-2">
            <NavigationMenuItem>
              <NavigationMenuLink
                className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/"
              >
                <Home className="h-4 w-4" />
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/scan"
              >
                <Scan className="h-4 w-4" />
                Scan
              </NavigationMenuLink>
            </NavigationMenuItem>
            {publicKey && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                    href="/alerts"
                  >
                    <Bell className="h-4 w-4" />
                    Alerts
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                    href="/portfolio"
                  >
                    <Briefcase className="h-4 w-4" />
                    Portfolio
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                    href="/profile"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
            <NavigationMenuItem>
              <NavigationMenuLink
                className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="/about"
              >
                <Info className="h-4 w-4" />
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="https://discord.gg/ERkJKhSYyr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="h-4 w-4" />
                Contact
              </NavigationMenuLink>
            </NavigationMenuItem>
            {isAdmin && (
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md cursor-pointer text-crypto-purple"
                  href="/admin"
                >
                  <User className="h-4 w-4" />
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