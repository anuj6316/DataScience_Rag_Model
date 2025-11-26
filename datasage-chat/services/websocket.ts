import { ChatResponse } from '../types';

type MessageCallback = (data: ChatResponse) => void;
type ErrorCallback = (error: string) => void;

// Configuration matching the provided FastAPI defaults
const WS_URL = 'ws://localhost:8000/ws/chat';

export class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private messageCallback: MessageCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private connectCallback: (() => void) | null = null;
  private disconnectCallback: (() => void) | null = null;
  
  // State to track if we should use mock responses
  private isMockMode: boolean = false;

  connect(
    onMessage: MessageCallback, 
    onError: ErrorCallback, 
    onConnect?: () => void,
    onDisconnect?: () => void
  ) {
    this.messageCallback = onMessage;
    this.errorCallback = onError;
    this.connectCallback = onConnect || null;
    this.disconnectCallback = onDisconnect || null;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('Connected to WebSocket');
        this.isMockMode = false;
        if (this.connectCallback) this.connectCallback();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle explicit error responses from backend
          if (data.error) {
            if (this.errorCallback) this.errorCallback(data.error);
            return;
          }
          if (this.messageCallback) this.messageCallback(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
          if (this.errorCallback) this.errorCallback('Invalid response from server');
        }
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket connection failed or refused. Switching to Mock Mode.');
        // Instead of surfacing the error, we switch to mock mode so the UI remains usable
        this.enableMockMode();
      };

      this.ws.onclose = () => {
        if (!this.isMockMode) {
          console.log('WebSocket connection closed');
          if (this.disconnectCallback) this.disconnectCallback();
        }
      };

    } catch (e) {
      console.warn('Failed to establish connection. Switching to Mock Mode.');
      this.enableMockMode();
    }
  }

  private enableMockMode() {
    this.isMockMode = true;
    // Simulate a successful connection for the UI
    if (this.connectCallback) this.connectCallback();
  }

  sendMessage(query: string, model: string = 'google_flash', searchEnabled: boolean = false) {
    // Handle Mock Mode
    if (this.isMockMode) {
      setTimeout(() => {
        const mockResponse: ChatResponse = {
          query: query,
          response: `[Offline Mode] I received your request: "${query}".\n\nI am currently operating in offline mode because the backend server (ws://localhost:8000) is unreachable. I can still demonstrate the UI interactions!\n\nSettings used:\n- Model: ${model}\n- Search: ${searchEnabled ? 'On' : 'Off'}`,
          metrics: {
            "Status": "Offline",
            "Latency": "15ms",
            "Model": model === 'google_pro' ? 'Mock Agent Pro' : 'Mock Agent Flash'
          },
          response_time: "0.02s"
        };
        if (this.messageCallback) this.messageCallback(mockResponse);
      }, 1000 + Math.random() * 1000); // Random delay between 1-2s
      return;
    }

    // Handle Real Connection
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ 
        query, 
        model,
        search_enabled: searchEnabled 
      }));
    } else {
      // If connection lost, try enabling mock mode to save the interaction
      this.enableMockMode();
      this.sendMessage(query, model, searchEnabled);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isMockMode = false;
  }
}

export const chatService = new ChatWebSocketService();