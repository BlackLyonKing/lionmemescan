
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const QuickBuy = () => {
  const [amount, setAmount] = useState("0.0");

  const handleBuy = () => {
    toast({
      title: "Purchase initiated",
      description: `Attempting to buy ${amount} tokens`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Quick Buy</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10"
            placeholder="Enter amount"
          />
          <Select defaultValue="1">
            <SelectTrigger className="w-24 bg-white/5 border-white/10">
              <SelectValue placeholder="$1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">$1</SelectItem>
              <SelectItem value="2">$2</SelectItem>
              <SelectItem value="3">$3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          onClick={handleBuy}
        >
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  );
};
