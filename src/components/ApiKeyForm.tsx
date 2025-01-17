import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from '@/services/FirecrawlService';

export const ApiKeyForm = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [hasActiveKey, setHasActiveKey] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [previousKeys, setPreviousKeys] = useState<string[]>([]);

  useEffect(() => {
    // Check if there's an active API key and load previous keys
    const checkApiKey = () => {
      const currentKey = FirecrawlService.getApiKey();
      setHasActiveKey(!!currentKey);
      if (currentKey) {
        // Mask the API key for display
        const maskedKey = `${currentKey.substring(0, 4)}...${currentKey.substring(currentKey.length - 4)}`;
        setActiveKey(maskedKey);
      } else {
        setActiveKey(null);
      }
      
      // Load previous keys from localStorage
      const storedKeys = FirecrawlService.getPreviousKeys();
      setPreviousKeys(storedKeys);
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
    
    // Update the active key display and previous keys list
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    setActiveKey(maskedKey);
    setPreviousKeys(FirecrawlService.getPreviousKeys());
  };

  const handleUnlink = () => {
    FirecrawlService.unlinkApiKey();
    toast({
      title: "Success",
      description: "API key unlinked successfully",
      duration: 3000,
    });
    setHasActiveKey(false);
    setActiveKey(null);
  };

  return (
    <div className="space-y-4">
      {hasActiveKey ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm text-green-500">Active API Key: {activeKey}</p>
          </div>
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

      {previousKeys.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Previously Used Keys:</h3>
          <div className="space-y-2">
            {previousKeys.map((key, index) => (
              <div key={index} className="p-2 bg-gray-800/50 rounded text-sm text-gray-400">
                {key}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};