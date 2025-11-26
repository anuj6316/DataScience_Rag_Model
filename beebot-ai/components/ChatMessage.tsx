import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { User, Bot, Clock, Activity, Layers, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { theme } = useTheme();
  const isUser = message.role === 'user';
  const [showMetadata, setShowMetadata] = useState(false);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser
          ? theme === 'dark' ? 'bg-white/10' : 'bg-black/5'
          : 'bg-gradient-to-br from-bee-400 to-orange-500 shadow-lg shadow-bee-500/20'
          }`}>
          {isUser
            ? <User size={16} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
            : <Bot size={18} className="text-white" />
          }
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
              ? theme === 'dark' ? 'bg-white/10 text-gray-100 rounded-tr-sm' : 'bg-black/5 text-gray-900 rounded-tr-sm'
              : theme === 'dark' ? 'glass-card border-white/5 text-gray-100 rounded-tl-sm' : 'glass-card-light border-black/5 text-gray-900 rounded-tl-sm'
            }
          `}>
            <div className="prose prose-invert prose-sm md:prose-base max-w-none 
              prose-p:leading-relaxed prose-p:my-3
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h1:text-2xl prose-h1:my-4 prose-h1:border-b prose-h1:border-gray-700 prose-h1:pb-2
              prose-h2:text-xl prose-h2:my-4 prose-h2:text-bee-400
              prose-h3:text-lg prose-h3:my-3 prose-h3:text-gray-300
              prose-h4:text-base prose-h4:my-2
              prose-ul:my-3 prose-ul:space-y-2 prose-ul:list-disc prose-ul:pl-5
              prose-ol:my-3 prose-ol:space-y-2 prose-ol:list-decimal prose-ol:pl-5
              prose-li:my-1.5 prose-li:leading-relaxed
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:bg-gray-800/30 prose-blockquote:py-2
              prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-bee-300 prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
              prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-4 prose-pre:overflow-x-auto
              prose-a:text-blue-400 prose-a:no-underline prose-a:font-medium hover:prose-a:underline hover:prose-a:text-blue-300
              prose-strong:text-gray-100 prose-strong:font-semibold
              prose-em:text-gray-300 prose-em:italic
              prose-hr:border-gray-700 prose-hr:my-6
              prose-table:w-full prose-table:my-4 prose-table:border-collapse
              prose-thead:border-b-2 prose-thead:border-gray-700
              prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:bg-gray-800/50 prose-th:text-gray-200
              prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-gray-800
              prose-tr:hover:bg-gray-800/30
              prose-img:rounded-lg prose-img:my-4 prose-img:shadow-lg
            ">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Metadata / Rich Content Section for Assistant */}
          {!isUser && message.metadata && (
            <div className={`w-full ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-black/5 border border-black/5'} rounded-xl overflow-hidden mt-2`}>
              {/* Toggle Header */}
              {(message.metadata.subQueries || message.metadata.metrics || message.metadata.diagramImages) && (
                <button
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-800/50 hover:bg-gray-800 transition-colors text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <Activity size={14} />
                    <span>Analysis Details</span>
                  </div>
                  {showMetadata ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}

              {/* Collapsible Content */}
              {showMetadata && (
                <div className="p-4 space-y-4 border-t border-gray-800">

                  {/* Response Time */}
                  {message.metadata.responseTime && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Clock size={12} />
                      <span>Processed in: <span className="text-bee-400">{message.metadata.responseTime}</span></span>
                    </div>
                  )}

                  {/* Sub Queries */}
                  {message.metadata.subQueries && message.metadata.subQueries.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                        <Layers size={12} />
                        Thought Process
                      </h4>
                      <ul className="space-y-1.5">
                        {message.metadata.subQueries.map((q, idx) => (
                          <li key={idx} className="text-xs text-gray-300 bg-gray-950/50 px-3 py-2 rounded-md border border-gray-800/50 flex items-start gap-2">
                            <span className="text-bee-500 font-mono opacity-60">0{idx + 1}.</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metrics Grid */}
                  {message.metadata.metrics && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500">Metrics</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(message.metadata.metrics).map(([key, value]) => (
                          <div key={key} className="bg-gray-950 px-3 py-2 rounded-lg border border-gray-800">
                            <span className="block text-[10px] text-gray-500 uppercase">{key}</span>
                            <span className="block text-sm font-mono text-bee-400">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagram Images */}
                  {message.metadata.diagramImages && message.metadata.diagramImages.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                        <ImageIcon size={12} />
                        Diagrams
                      </h4>
                      <div className="grid gap-3">
                        {message.metadata.diagramImages.map((img, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border border-gray-700 bg-white/5">
                            {/* Assuming img is a base64 string or url. If it's a raw SVG string, might need parsing, but safe assumption for now is URL/Base64 */}
                            <img src={img} alt={`Diagram ${idx + 1}`} className="w-full h-auto" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};