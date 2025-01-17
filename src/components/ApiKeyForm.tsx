import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FirecrawlService } from '@/services/FirecrawlService';

export const ApiKeyForm = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    FirecrawlService.saveApiKey(apiKey);
    toast({
      title: "Success",
      description: "API key saved successfully",
      duration: 3000,
    });
    setApiKey('');
  };

  return (
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
  );
};