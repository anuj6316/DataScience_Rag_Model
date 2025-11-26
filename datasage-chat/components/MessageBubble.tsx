import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Bot, User, Share2, ThumbsUp, ThumbsDown, Copy, RotateCcw, ChevronDown, Image as ImageIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onSuggestionClick?: (suggestion: string) => void;
}

// Helper to construct image URL
const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `http://localhost:8000/images/${path}`;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSuggestionClick }) => {
  const isUser = message.role === 'user';
  const [isImagesOpen, setIsImagesOpen] = useState(false);

  if (isUser) {
    return (
      <div className="flex justify-end mb-8 group">
        <div className="flex gap-4 flex-row-reverse items-end max-w-[85%]">
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white dark:ring-slate-900">
            S
          </div>

          {/* Bubble */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl rounded-tr-sm px-6 py-4 shadow-lg shadow-indigo-500/10 text-[15px] leading-relaxed font-medium">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex gap-5 mb-12 max-w-full group">
      {/* Bot Avatar */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 flex-shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm mt-1">
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-80 blur-[2px]"></div>
          <div className="relative w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800 rounded-2xl rounded-tl-sm p-6 shadow-sm">

          {/* Main Text Content */}
          {message.content && (
            <div className="text-slate-800 dark:text-slate-200 text-[16px] leading-7 font-normal tracking-wide break-words overflow-hidden max-w-full prose prose-slate dark:prose-invert max-w-none prose-p:leading-7 prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700/50 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => <a {...props} className="text-indigo-500 hover:text-indigo-600 underline underline-offset-2" target="_blank" rel="noopener noreferrer" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Images / Diagrams Section */}
          {message.images && message.images.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setIsImagesOpen(!isImagesOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors w-full sm:w-auto"
              >
                <ImageIcon size={16} className="text-indigo-500" />
                <span>{isImagesOpen ? 'Hide' : 'View'} {message.images.length} Generated Image{message.images.length > 1 ? 's' : ''}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isImagesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isImagesOpen && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {message.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-slate-50 dark:bg-slate-800">
                      <img
                        src={getImageUrl(img)}
                        alt="Data visualization"
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => window.open(getImageUrl(img), '_blank')}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related Questions / Suggestions */}
          {message.relatedQuestions && message.relatedQuestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {message.relatedQuestions.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick?.(query)}
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-sm px-4 py-2 rounded-xl transition-all duration-200 font-medium border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm text-left hover:shadow-md active:scale-95"
                >
                  {query}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Action Bar */}
        {!message.isThinking && (
          <div className="flex items-center gap-2 pl-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ActionButton icon={<RotateCcw size={14} />} tooltip="Regenerate" />
            <ActionButton icon={<Copy size={14} />} tooltip="Copy" />
            <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
            <ActionButton icon={<ThumbsUp size={14} />} tooltip="Helpful" />
            <ActionButton icon={<ThumbsDown size={14} />} tooltip="Not helpful" />
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode; tooltip: string }> = ({ icon, tooltip }) => (
  <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title={tooltip}>
    {icon}
  </button>
);