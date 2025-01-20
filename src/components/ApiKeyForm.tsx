import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FirecrawlService } from '@/services/FirecrawlService';

export const ApiKeyForm = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Testing API key:', apiKey);
      const isValid = await FirecrawlService.getApiKey();
      
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey);
        toast({
          title: "Success",
          description: "API key saved successfully",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid API key",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            Firecrawl API Key
          </label>
          <Input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Firecrawl API key"
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save API Key"}
        </Button>
      </form>
    </Card>
  );
};