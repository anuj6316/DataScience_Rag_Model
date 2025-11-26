import React from 'react';
import { Loader2 } from 'lucide-react';

interface ThinkingBubbleProps {
  status?: string;
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ status }) => {
  return (
    <div className="flex gap-4 mb-8 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 animate-ping" />
        {status || 'Processing your request...'}
      </div>
    </div>
  );
};