
class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private connectHandlers: (() => void)[] = [];
  private disconnectHandlers: (() => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private reconnectTimer: number | null = null;
  private lastMessageTime: number = Date.now();
  private heartbeatInterval: number | null = null;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.socket = new WebSocket('wss://pumpportal.fun/ws');

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.lastMessageTime = Date.now();
        this.startHeartbeat();
        this.connectHandlers.forEach(handler => handler());
        
        // Subscribe to token data and creation events
        if (this.socket) {
          this.socket.send(JSON.stringify({
            type: 'subscribe',
            channel: 'tokens',
            filters: {
              minMarketCap: 0,
              maxAge: '24h'
            }
          }));
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.lastMessageTime = Date.now();
          console.log('Received WebSocket message:', data);
          
          // Handle different message types
          if (data.type === 'token' || data.type === 'token_update') {
            this.messageHandlers.forEach(handler => handler({
              type: data.type,
              data: {
                ...data.data,
                createdAt: data.data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.socket?.readyState !== WebSocket.OPEN) {
          this.attemptReconnect();
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.stopHeartbeat();
        this.disconnectHandlers.forEach(handler => handler());
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      const now = Date.now();
      if (now - this.lastMessageTime > 30000) { // 30 seconds without messages
        console.log('No messages received for 30 seconds, reconnecting...');
        this.reconnect();
      }
      
      // Send heartbeat
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 15000); // Check every 15 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private reconnect() {
    this.disconnect();
    this.connect();
  }

  private attemptReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.reconnectTimer = window.setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribeToMessages(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  unsubscribeFromMessages(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  onConnect(handler: () => void) {
    this.connectHandlers.push(handler);
  }

  offConnect(handler: () => void) {
    this.connectHandlers = this.connectHandlers.filter(h => h !== handler);
  }

  onDisconnect(handler: () => void) {
    this.disconnectHandlers.push(handler);
  }

  offDisconnect(handler: () => void) {
    this.disconnectHandlers = this.disconnectHandlers.filter(h => h !== handler);
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService();
