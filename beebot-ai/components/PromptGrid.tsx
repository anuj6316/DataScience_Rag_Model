import React from 'react';
import { Lightbulb, PenTool, MessageSquare, FileText } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface PromptGridProps {
    onSelect: (prompt: string) => void;
}

const prompts = [
    {
        icon: Lightbulb,
        text: "Get fresh perspectives on tricky problems",
        prompt: "Help me think through a complex problem I'm facing..."
    },
    {
        icon: PenTool,
        text: "Brainstorm creative ideas",
        prompt: "I need creative ideas for..."
    },
    {
        icon: MessageSquare,
        text: "Rewrite message for maximum impact",
        prompt: "Help me rewrite this message to be more impactful..."
    },
    {
        icon: FileText,
        text: "Summarize key points",
        prompt: "Can you summarize the key points of..."
    }
];

export const PromptGrid: React.FC<PromptGridProps> = ({ onSelect }) => {
    const { theme } = useTheme();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mx-auto px-4">
            {prompts.map((item, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(item.prompt)}
                    className={`
            text-left p-4 rounded-2xl transition-all duration-200 prompt-card group
            ${theme === 'dark'
                            ? 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-200'
                            : 'bg-white hover:bg-mint-50 border border-gray-100 text-gray-700 shadow-sm'}
          `}
                >
                    <div className="mb-3 opacity-70 group-hover:opacity-100 transition-opacity">
                        <item.icon size={20} className={theme === 'dark' ? 'text-mint-400' : 'text-mint-600'} />
                    </div>
                    <span className="text-sm font-medium leading-tight block">
                        {item.text}
                    </span>
                </button>
            ))}
        </div>
    );
};
