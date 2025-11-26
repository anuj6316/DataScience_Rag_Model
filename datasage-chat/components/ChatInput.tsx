import React, { useRef, useEffect, useState } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Globe,
  ChevronDown,
  Zap,
  Sparkles,
  Check,
  Image as ImageIcon,
  Code2
} from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isConnected: boolean;
  className?: string;
  autoFocus?: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isSearchEnabled: boolean;
  onSearchToggle: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyDown,
  isConnected,
  className = '',
  autoFocus = false,
  selectedModel,
  onModelChange,
  isSearchEnabled,
  onSearchToggle
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const models = [
    { id: 'google_flash', name: 'Gemini Flash', icon: Zap, desc: 'Fastest for everyday tasks' },
    { id: 'google_pro', name: 'Gemini Pro', icon: Sparkles, desc: 'Best for complex reasoning' },
    { id: 'openrouter_grok', name: 'Grok 4.1', icon: Zap, desc: 'High speed via OpenRouter' },
    { id: 'ollama_qwen3_coder', name: 'Qwen3 Coder', icon: Code2, desc: 'Specialized for coding tasks' },
    { id: 'gpt-oss:120b-cloud', name: 'GPT-OSS 120B', icon: Sparkles, desc: 'Large open-source model' },
  ];

  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className={`group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-indigo-500/10 dark:shadow-black/50 border border-white/40 dark:border-slate-700/50 transition-all duration-300 hover:shadow-indigo-500/20 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/30 ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask anything..."
        className="w-full pl-6 pr-16 pt-5 pb-16 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none font-medium text-lg leading-relaxed selection:bg-indigo-100 dark:selection:bg-indigo-900/50"
        rows={1}
        style={{ minHeight: '80px' }}
      />

      {/* Bottom Toolbar */}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <ToolbarButton icon={<Paperclip size={20} />} tooltip="Attach file" />
          <ToolbarButton icon={<ImageIcon size={20} />} tooltip="Upload image" />
          <ToolbarButton icon={<Mic size={20} />} tooltip="Voice input" />

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

          {/* Search Toggle */}
          <button
            onClick={onSearchToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${isSearchEnabled
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
          >
            <Globe size={16} className={isSearchEnabled ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Model Selector */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <currentModel.icon size={16} className={selectedModel === 'google_flash' ? 'text-amber-500' : 'text-indigo-500'} />
              <span className="hidden sm:inline">{currentModel.name}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 text-slate-400 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isModelDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-3 w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200 origin-bottom-left">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wider">Select Model</div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`group w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 ${selectedModel === model.id
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${model.id === 'google_flash'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                      }`}>
                      <model.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${selectedModel === model.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'}`}>
                        {model.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {model.desc}
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <div className="flex items-center justify-center h-full pt-1">
                        <Check size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onSend}
          disabled={!isConnected || !value.trim()}
          className={`w-11 h-11 flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none ${isConnected
            ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 hover:shadow-indigo-500/30 dark:hover:shadow-indigo-500/20'
            : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
            }`}
        >
          <Send size={20} className={value.trim() ? 'ml-0.5' : ''} />
        </button>
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ icon: React.ReactNode; tooltip: string }> = ({ icon, tooltip }) => (
  <button
    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200"
    title={tooltip}
  >
    {icon}
  </button>
);