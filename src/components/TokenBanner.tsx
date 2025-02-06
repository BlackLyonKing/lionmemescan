import { useEffect, useState } from "react";
import { TopTokensBanner } from "./TopTokensBanner";
import { webSocketService } from "@/services/WebSocketService";
import { useToast } from "@/hooks/use-toast";

interface TokenBannerProps {
  hasAccess: boolean;
}

export const TokenBanner = ({ hasAccess }: TokenBannerProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!hasAccess) return;

    const handleConnect = () => {
      setIsConnected(true);
      toast({
        title: "Connected to PumpPortal",
        description: "Receiving real-time token data",
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      toast({
        title: "Disconnected from PumpPortal",
        description: "Attempting to reconnect...",
        variant: "destructive",
      });
    };

    webSocketService.onConnect(handleConnect);
    webSocketService.onDisconnect(handleDisconnect);
    webSocketService.connect();

    return () => {
      webSocketService.disconnect();
      webSocketService.offConnect(handleConnect);
      webSocketService.offDisconnect(handleDisconnect);
    };
  }, [hasAccess, toast]);

  if (!hasAccess) {
    return null;
  }

  return <TopTokensBanner />;
};