
export interface ChatResponse {
  query: string;
  response: string;
  context?: string | null;
  metrics?: Record<string, string> | null;
  response_time?: string | null;
  sub_queries?: string[] | null;
  diagram_images?: string[] | null;
  error?: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    metrics?: Record<string, string>;
    responseTime?: string;
    subQueries?: string[];
    diagramImages?: string[];
    context?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string; // ISO string
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Project Management Types
export interface FunctionalityItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface BugFix {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'fixed' | 'verified';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  fixedAt?: string;
}

export interface QuickNote {
  id: string;
  content: string;
  category: 'idea' | 'todo' | 'reminder' | 'other';
  createdAt: string;
}

export interface ProjectInfo {
  name: string;
  version: string;
  description: string;
  lastUpdated: string;
}
