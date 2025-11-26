export interface ChatRequest {
  query: string;
  model?: string;
}

export interface ChatResponse {
  query: string;
  response: string;
  context?: string;
  metrics?: Record<string, string>;
  response_time?: string;
  sub_queries?: string[];
  related_questions?: string[];
  diagram_images?: string[];
  error?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metrics?: Record<string, string>;
  images?: string[];
  subQueries?: string[];
  relatedQuestions?: string[];
  isThinking?: boolean;
}

export interface WebSocketMessage {
  type: 'message' | 'error';
  payload: ChatResponse | { error: string };
}
