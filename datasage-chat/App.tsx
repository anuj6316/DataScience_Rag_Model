import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';
import { ThinkingBubble } from './components/ThinkingBubble';
import { Hero } from './components/Hero';
import { ChatInput } from './components/ChatInput';
import { chatService } from './services/websocket';
import { Message, ChatResponse } from './types';
import {
  Share,
  ChevronDown,
  MoreHorizontal,
  PanelLeft,
  Sparkles,
  Activity,
  Settings,
  Circle
} from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentMetrics, setCurrentMetrics] = useState<Record<string, string> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Model & Search State
  const [selectedModel, setSelectedModel] = useState('google_flash');
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  useEffect(() => {
    // Initial connection
    chatService.connect(
      handleServerMessage,
      (error) => console.error('WS Error:', error),
      () => setIsConnected(true),
      () => setIsConnected(false)
    );

    return () => chatService.disconnect();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const scrollToBottom = () => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServerMessage = (data: any) => {
    // Handle status updates
    if (data.type === 'status') {
      setIsProcessing(true);
      setStatusMessage(data.content);
      return;
    }

    // Handle streaming token
    if (data.type === 'token') {
      setIsProcessing(false); // Start showing message immediately
      setStatusMessage(''); // Clear status
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];

        // If the last message is from assistant, append to it
        if (lastMsg && lastMsg.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: lastMsg.content + data.content }
          ];
        }

        // Otherwise create a new assistant message
        return [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.content,
            timestamp: new Date()
          }
        ];
      });
      return;
    }

    // Handle completion with metadata
    if (data.type === 'complete') {
      setIsProcessing(false);
      const finalData = data.data;

      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMsg,
              content: finalData.response, // Ensure full consistency
              metrics: finalData.metrics,
              images: finalData.diagram_images,
              subQueries: finalData.sub_queries,
              relatedQuestions: finalData.related_questions
            }
          ];
        }
        return prev;
      });

      if (finalData.metrics) {
        setCurrentMetrics(finalData.metrics);
      }
      return;
    }

    // Legacy/Error handling
    if (data.error) {
      setIsProcessing(false);
      console.error('Server Error:', data.error);
      return;
    }

    // Fallback for non-streaming responses (if any)
    if (data.response) {
      setIsProcessing(false);
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        metrics: data.metrics,
        images: data.diagram_images,
        subQueries: data.sub_queries,
        relatedQuestions: data.related_questions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      if (data.metrics) {
        setCurrentMetrics(data.metrics);
      }
    }
  };

  const handleSendMessage = (text?: string) => {
    const contentToSend = text || inputValue;
    if (!contentToSend.trim()) return;

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    chatService.sendMessage(contentToSend, selectedModel, isSearchEnabled);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <div className={`flex h-screen font-sans text-slate-800 dark:text-slate-100 overflow-hidden bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 selection:bg-indigo-100 dark:selection:bg-indigo-900/30`}>
      <Sidebar
        isDarkMode={darkMode}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative isolate">

        {/* Ambient Background Animation */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Top Right Blob */}
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-200/30 via-purple-200/30 to-blue-200/30 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-blue-900/20 blur-[120px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen" />
          {/* Bottom Left Blob */}
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-pink-200/30 via-rose-200/30 to-indigo-200/30 dark:from-pink-900/10 dark:via-rose-900/10 dark:to-indigo-900/20 blur-[100px] animate-pulse-slower mix-blend-multiply dark:mix-blend-screen" />
        </div>

        {/* Header */}
        <header className="flex justify-between items-center px-4 md:px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
              title="Toggle Sidebar"
            >
              <PanelLeft size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                className="group flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
              >
                <span className="text-lg">DataSage</span>
                <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border border-indigo-200 dark:border-indigo-500/30">Beta</span>
                <ChevronDown size={14} className={`opacity-50 group-hover:opacity-100 transition-transform duration-200 ${isHeaderMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Status Dropdown */}
              {isHeaderMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsHeaderMenuOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-left">
                    {/* Status Item */}
                    <div className="px-3 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl mb-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">System Status</div>
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        </span>
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isConnected ? 'Operational' : 'Disconnected'}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            v1.0.0-beta
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-1" />

                    <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-1" />

                    {/* Metrics Section */}
                    <div className="px-3 py-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Latest Response Metrics</div>
                      {currentMetrics ? (
                        <div className="space-y-2">
                          {Object.entries(currentMetrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-mono font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic text-center py-2">No metrics available</div>
                      )}
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-700/50 my-1" />

                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Settings size={16} className="text-slate-400" />
                      <span>Settings</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md">
              <Share size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button className="p-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        {messages.length === 0 ? (
          // HERO SECTION
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            <Hero onSuggestionClick={handleSuggestionClick}>
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onKeyDown={handleKeyDown}
                onSend={() => handleSendMessage()}
                isConnected={isConnected}
                autoFocus={true}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                isSearchEnabled={isSearchEnabled}
                onSearchToggle={() => setIsSearchEnabled(!isSearchEnabled)}
              />
            </Hero>
          </div>
        ) : (
          // CHAT INTERFACE
          <>
            <div className="flex-1 overflow-y-auto px-4 md:px-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <div className="max-w-[95%] mx-auto py-12 md:py-16 space-y-8">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onSuggestionClick={handleSuggestionClick}
                  />
                ))}

                {isProcessing && <ThinkingBubble status={statusMessage} />}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            {/* Bottom Input Area */}
            <div className="p-4 md:p-6 pb-8 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent dark:from-slate-950 dark:via-slate-950 transition-colors duration-300 z-10">
              <div className="max-w-[95%] mx-auto">
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onKeyDown={handleKeyDown}
                  onSend={() => handleSendMessage()}
                  isConnected={isConnected}
                  autoFocus={true}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  isSearchEnabled={isSearchEnabled}
                  onSearchToggle={() => setIsSearchEnabled(!isSearchEnabled)}
                />

                <div className="text-center mt-4">
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-600 font-medium">
                    <Sparkles size={10} />
                    DataSage may display inaccurate info, please double-check responses.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;