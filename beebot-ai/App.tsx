

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectManagement } from './components/ProjectManagement';
import { Message, ConnectionStatus, ChatResponse, ChatSession } from './types';
import { AlertCircle } from 'lucide-react';
import { useTheme } from './ThemeContext';



// WebSocket URL
const WS_URL = 'ws://localhost:8000/ws/chat';

export default function App() {
  const { theme } = useTheme();

  // Page routing
  const [currentPage, setCurrentPage] = useState<'chat' | 'project'>('chat');

  // State for Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('google_flash');

  // Refs for managing WebSocket and active session within closures
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSessionIdRef = useRef<string | null>(null);

  // Sync ref with state
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('beebot_sessions');
    if (stored) {
      try {
        const parsed: ChatSession[] = JSON.parse(stored);
        // Hydrate dates for messages
        const hydrated = parsed.map(s => ({
          ...s,
          messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setSessions(hydrated);

        // Restore last active session or default to most recent
        const lastActive = localStorage.getItem('beebot_active_session');
        if (lastActive && hydrated.find(s => s.id === lastActive)) {
          setActiveSessionId(lastActive);
        } else if (hydrated.length > 0) {
          setActiveSessionId(hydrated[0].id);
        } else {
          createNewSession();
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('beebot_sessions', JSON.stringify(sessions));
    }
    if (activeSessionId) {
      localStorage.setItem('beebot_active_session', activeSessionId);
    }
  }, [sessions, activeSessionId]);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSidebarOpen(false); // Close mobile sidebar if open
    return newSession.id;
  }, []);

  const deleteSession = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        // If we deleted the last one, create a new one immediately after render
        setTimeout(createNewSession, 0);
      }
      return filtered;
    });

    if (activeSessionId === id) {
      setActiveSessionId(null); // Effect will pick next available or create new
    }
  }, [activeSessionId, createNewSession]);

  // WebSocket Connection
  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connectWebSocket = () => {
      setStatus('connecting');
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('Connected to BeeBot Backend');
        setStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: ChatResponse = JSON.parse(event.data);

          // Handle error responses from backend
          if (data.error) {
            const errorMsg: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: `⚠️ Error: ${data.error}`,
              timestamp: new Date(),
              metadata: {
                context: data.error
              }
            };

            setSessions(prev => prev.map(session => {
              if (session.id === activeSessionIdRef.current) {
                return {
                  ...session,
                  messages: [...session.messages, errorMsg]
                };
              }
              return session;
            }));

            setIsTyping(false);
            return;
          }

          const botMsg: Message = {
            id: Date.now().toString(),

            const { status, sendMessage, lastMessage } = useWebSocket('ws://localhost:8000/ws/chat');

            useEffect(() => {
      if (lastMessage) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: lastMessage.data,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }
    }, [lastMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    sendMessage(text);
  };

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-500 ${theme === 'dark' ? 'bg-think-dark text-white' : 'bg-think-light text-gray-900'}`}>

      <Header status={status} onMenuClick={() => { }} />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {messages.length === 0 ? (
          // Landing State
          <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
              <Hero status={status} />
              <div className="w-full mt-8">
                <PromptGrid onSelect={handleSendMessage} />
              </div>
            </div>
          </div>
        ) : (
          // Chat State
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl rounded-tl-none px-6 py-4 flex items-center space-x-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                    <div className="w-2 h-2 bg-mint-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-mint-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-mint-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Area - Always at bottom */}
        <div className="p-4 md:p-6 z-10">
          <ChatInput
            onSend={handleSendMessage}
            disabled={status !== 'connected' && status !== 'ready'}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
