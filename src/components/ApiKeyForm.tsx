import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from '@/services/FirecrawlService';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWallet } from '@solana/wallet-adapter-react';

export const ApiKeyForm = () => {
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const [apiKey, setApiKey] = useState('');
  const [hasActiveKey, setHasActiveKey] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [previousKeys, setPreviousKeys] = useState<string[]>([]);
  const [saveToList, setSaveToList] = useState(false);

  useEffect(() => {
    // Check if there's an active API key and load previous keys
    const checkApiKey = () => {
      const currentKey = FirecrawlService.getApiKey(publicKey?.toString());
      setHasActiveKey(!!currentKey);
      if (currentKey) {
        // Mask the API key for display
        const maskedKey = `${currentKey.substring(0, 4)}...${currentKey.substring(currentKey.length - 4)}`;
        setActiveKey(maskedKey);
      } else {
        setActiveKey(null);
      }
      
      // Load previous keys from localStorage
      const storedKeys = FirecrawlService.getPreviousKeys(publicKey?.toString());
      setPreviousKeys(storedKeys);
    };

    // Check initially and set up interval
    checkApiKey();
    const interval = setInterval(checkApiKey, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [publicKey]); // Add publicKey to dependency array

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    FirecrawlService.saveApiKey(apiKey, publicKey?.toString());
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
    setPreviousKeys(FirecrawlService.getPreviousKeys(publicKey?.toString()));
  };

  const handleUnlink = () => {
    FirecrawlService.unlinkApiKey(publicKey?.toString());
    toast({
      title: "Success",
      description: "API key unlinked successfully",
      duration: 3000,
    });
    setHasActiveKey(false);
    setActiveKey(null);
  };

  const handleToggleSave = (checked: boolean) => {
    setSaveToList(checked);
    const currentKey = FirecrawlService.getApiKey(publicKey?.toString());
    if (checked && currentKey) {
      // Add to saved keys list
      const maskedKey = `${currentKey.substring(0, 4)}...${currentKey.substring(currentKey.length - 4)}`;
      if (!previousKeys.includes(maskedKey)) {
        const newKeys = [maskedKey, ...previousKeys];
        localStorage.setItem(FirecrawlService.getStorageKeyForWallet('previous_keys', publicKey?.toString()), JSON.stringify(newKeys));
        setPreviousKeys(newKeys);
        toast({
          title: "Success",
          description: "API key added to saved list",
          duration: 3000,
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {hasActiveKey ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-500">Active API Key: {activeKey}</p>
              <div className="flex items-center space-x-2">
                <Switch
                  id="save-key"
                  checked={saveToList}
                  onCheckedChange={handleToggleSave}
                />
                <Label htmlFor="save-key" className="text-sm text-muted-foreground">Save to list</Label>
              </div>
            </div>
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