
class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private connectHandlers: (() => void)[] = [];
  private disconnectHandlers: (() => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private reconnectTimer: number | null = null;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      // Connect directly to PumpPortal WebSocket
      this.socket = new WebSocket('wss://pumpportal.fun/api/data');

      this.socket.onopen = () => {
        console.log('WebSocket connected to PumpPortal');
        this.reconnectAttempts = 0;
        this.connectHandlers.forEach(handler => handler());
        
        // Subscribe to both token trade and creation data
        if (this.socket) {
          this.socket.send(JSON.stringify({
            method: "subscribeTokenTrade"
          }));
          this.socket.send(JSON.stringify({
            method: "subscribeTokenCreation"
          }));
        }
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        this.messageHandlers.forEach(handler => handler(data));
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.socket?.readyState !== WebSocket.OPEN) {
          this.attemptReconnect();
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected from PumpPortal');
        this.disconnectHandlers.forEach(handler => handler());
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
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

  subscribeToMessages(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  unsubscribeFromMessages(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  disconnect() {
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
