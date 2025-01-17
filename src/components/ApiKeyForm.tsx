import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from '@/services/FirecrawlService';

export const ApiKeyForm = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [hasActiveKey, setHasActiveKey] = useState(false);

  useEffect(() => {
    // Check if there's an active API key
    const checkApiKey = () => {
      const currentKey = FirecrawlService.getApiKey();
      setHasActiveKey(!!currentKey);
    };

    // Check initially and set up interval
    checkApiKey();
    const interval = setInterval(checkApiKey, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    FirecrawlService.saveApiKey(apiKey);
    toast({
      title: "Success",
      description: "API key saved successfully (valid for 30 minutes)",
      duration: 3000,
    });
    setApiKey('');
    setHasActiveKey(true);
  };

  const handleUnlink = () => {
    FirecrawlService.unlinkApiKey();
    toast({
      title: "Success",
      description: "API key unlinked successfully",
      duration: 3000,
    });
    setHasActiveKey(false);
  };

  return (
    <div className="space-y-4">
      {hasActiveKey ? (
        <div className="space-y-4">
          <p className="text-sm text-green-500">API key is active</p>
          <Button 
            onClick={handleUnlink}
            variant="destructive"
            className="w-full"
          >
            Unlink API Key
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium text-gray-300">
              Firecrawl API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
              placeholder="Enter your API key"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save API Key
          </Button>
        </form>
      )}
    </div>
  );
};