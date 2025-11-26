import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-gray-800 dark:bg-gray-800 light:bg-gray-200 border border-gray-700 dark:border-gray-700 light:border-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300 transition-all duration-300 group"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon (Light Mode) */}
                <Sun
                    className={`absolute inset-0 text-yellow-500 transition-all duration-500 ${theme === 'light'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 rotate-90 scale-0'
                        }`}
                    size={20}
                />

                {/* Moon Icon (Dark Mode) */}
                <Moon
                    className={`absolute inset-0 text-blue-400 transition-all duration-500 ${theme === 'dark'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                    size={20}
                />
            </div>

            {/* Glow effect on hover */}
            <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${theme === 'dark' ? 'bg-blue-400' : 'bg-yellow-400'
                }`} />
        </button>
    );
};
