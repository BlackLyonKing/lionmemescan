class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private connectHandlers: (() => void)[] = [];
  private disconnectHandlers: (() => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = new WebSocket(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pump-portal-websocket`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.connectHandlers.forEach(handler => handler());
      
      // Subscribe to token data
      if (this.socket) {
        this.socket.send(JSON.stringify({
          method: "subscribeTokenTrade"
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
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.disconnectHandlers.forEach(handler => handler());
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
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
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService();