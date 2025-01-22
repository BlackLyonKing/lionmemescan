import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FirecrawlService } from '@/services/FirecrawlService';
import { Card } from "@/components/ui/card";
import { ApiKeyForm } from './ApiKeyForm';

export const CrawlForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crawlResult, setCrawlResult] = useState<any>(null);

  const handleCrawl = async () => {
    setIsLoading(true);
    setProgress(0);
    setCrawlResult(null);
    
    try {
      const result = await FirecrawlService.crawlPumpFun();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Crawl completed successfully",
          duration: 3000,
        });
        setCrawlResult(result);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to crawl website",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error during crawl:', error);
      toast({
        title: "Error",
        description: "Failed to crawl website",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="space-y-8">
      <ApiKeyForm />
      
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Crawl Pump.fun</h3>
          
          {isLoading && (
            <Progress value={progress} className="w-full" />
          )}
          
          <Button
            onClick={handleCrawl}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Crawling..." : "Start Crawl"}
          </Button>
        </div>

        {crawlResult && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium">Results:</h4>
            <div className="bg-secondary/50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(crawlResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};