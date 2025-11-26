import React from 'react';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, User } from 'lucide-react';

interface HeaderProps {
  status: string;
  onMenuClick: () => void;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`
      flex items-center justify-between px-6 py-4
      ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
    `}>
      {/* Logo Area */}
      <div className="flex items-center space-x-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}
        `}>
          <div className="w-4 h-4 rounded-full bg-mint-400 shadow-lg shadow-mint-400/50"></div>
        </div>
        <span className="font-semibold text-lg tracking-tight">ThinkAI</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
          ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}
        `}>
          M
        </div>
      </div>
    </header>
  );
};