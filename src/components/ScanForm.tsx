import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FirecrawlService } from '@/services/FirecrawlService';
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ScanForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sortCriteria, setSortCriteria] = useState('marketCap');

  const handleScan = async () => {
    setIsLoading(true);
    setProgress(0);
    
    try {
      console.log('Starting memecoin scan');
      const result = await FirecrawlService.scanMemecoins();
      
      if ('success' in result && result.success) {
        toast({
          title: "Success",
          description: "Scan completed successfully",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: 'error' in result ? result.error : "Failed to scan memecoins",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error during scan:', error);
      toast({
        title: "Error",
        description: "Failed to scan memecoins",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Scan Settings</h3>
          <Select
            value={sortCriteria}
            onValueChange={setSortCriteria}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marketCap">Market Cap</SelectItem>
              <SelectItem value="holders">Holders</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="graduatedPercent">Graduated %</SelectItem>
              <SelectItem value="creationTime">Creation Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading && (
          <Progress value={progress} className="w-full" />
        )}
        
        <Button
          onClick={handleScan}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Scanning..." : "Start Scan"}
        </Button>
      </div>
    </Card>
  );
};