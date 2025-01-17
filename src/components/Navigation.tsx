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

export const Navigation = () => {
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
                href="#saved-keys"
              >
                Saved API Keys
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className="block px-4 py-2 hover:bg-accent rounded-md cursor-pointer"
                href="#saved-tokens"
              >
                Saved Tokens
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </SheetContent>
    </Sheet>
  );
};