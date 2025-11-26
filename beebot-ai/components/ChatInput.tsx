import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Camera, ChevronDown } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSend(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
};

// Auto-resize textarea
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
  }
}, [text]);

return (
  <div className="relative group w-full max-w-3xl mx-auto">
    <div className={`
        relative flex flex-col gap-3 border rounded-3xl p-4 shadow-xl transition-all duration-300
        ${theme === 'dark'
        ? 'bg-gray-900/80 border-white/10 shadow-black/20 backdrop-blur-xl'
        : 'bg-white border-gray-100 shadow-blue-500/5'
      }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-bee-500/30 focus-within:border-bee-500/50 focus-within:ring-1 focus-within:ring-bee-500/20'}
      `}>

      {/* Text Area Area */}
      <div className="flex items-start gap-3">
        <div className={`mt-2 ${theme === 'dark' ? 'text-bee-400' : 'text-blue-500'}`}>
          <Sparkles size={18} />
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Initiate a query or send a command to the AI..."
          disabled={disabled}
          rows={1}
          className={`
                flex-1 bg-transparent focus:outline-none py-2 min-h-[60px] max-h-[200px] resize-none overflow-y-auto text-base leading-relaxed
                ${theme === 'dark' ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
            `}
        />
      </div>

      {/* Bottom Actions Row */}
      <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200/10">
        {/* Left Actions (Tools) */}
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium ${theme === 'dark' ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>

          <div className={`h-4 w-px ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />

          <button className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            <BrainCircuit size={14} />
            <span>Reasoning</span>
          </button>

          <button className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            <ImageIcon size={14} />
            <span>Create Image</span>
          </button>

          <button className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            <Search size={14} />
            <span>Deep Research</span>
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={disabled || !text.trim()}
          className={`
                    p-2.5 rounded-xl transition-all duration-300 shadow-lg
                    ${text.trim()
              ? 'bg-gradient-to-r from-bee-500 to-orange-500 text-white transform hover:scale-105 active:scale-95 shadow-bee-500/20'
              : theme === 'dark' ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
                `}
        >
          <Send size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>

    {/* Decorative Glow for Dark Mode */}
    {theme === 'dark' && (
      <div className="absolute -inset-0.5 bg-gradient-to-r from-bee-500/20 to-orange-500/20 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl -z-10" />
    )}
  </div>
);
};