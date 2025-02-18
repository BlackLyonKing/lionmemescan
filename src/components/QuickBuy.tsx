
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export const QuickBuy = () => {
  const [amount, setAmount] = useState("0.0");

  return (
    <Card className="p-4 bg-black/20 border-white/5">
      <h3 className="text-lg font-semibold mb-4">Quick Buy</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10"
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
        <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
          Buy Now
        </Button>
      </div>
    </Card>
  );
};
