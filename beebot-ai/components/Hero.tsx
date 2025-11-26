import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, Brain, MessageSquare, AlertCircle } from 'lucide-react';
import { ConnectionStatus } from '../types';
import { useTheme } from '../ThemeContext';

interface HeroProps {
    status: ConnectionStatus;
}

export function Hero({ status }: HeroProps) {
    const { theme } = useTheme();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        { icon: Brain, text: 'AI-Powered Analysis', color: 'from-purple-500 to-pink-500' },
        { icon: Zap, text: 'Lightning Fast', color: 'from-yellow-500 to-orange-500' },
        { icon: MessageSquare, text: 'Natural Conversations', color: 'from-blue-500 to-cyan-500' },
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden px-4">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${theme === 'dark' ? 'bg-bee-500/20' : 'bg-bee-400/30'} rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow`} />
                    <div className={`absolute top-1/3 right-1/4 w-96 h-96 ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-400/30'} rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow`} style={{ animationDelay: '1s' }} />
                    <div className={`absolute bottom-1/4 left-1/3 w-96 h-96 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-400/30'} rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow`} style={{ animationDelay: '2s' }} />
                </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-1 h-1 ${theme === 'dark' ? 'bg-bee-400/30' : 'bg-bee-500/40'} rounded-full animate-pulse`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                {/* Logo/Icon with Holographic Glow Effect */}
                <div
                    className="relative inline-block mb-8"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className={`
            w-24 h-24 mx-auto rounded-2xl flex items-center justify-center transform transition-all duration-500
            ${isHovered ? 'scale-105 rotate-3' : 'scale-100 rotate-0'}
            ${theme === 'dark' ? 'glass-card glow-purple' : 'bg-white shadow-xl shadow-blue-500/10'}
          `}>
                        {/* Holographic animated orb - Simplified */}
                        <div className={`absolute inset-0 rounded-2xl opacity-30 blur-xl ${theme === 'dark' ? 'holographic animate-holographic' : 'bg-gradient-to-tr from-blue-400 to-purple-400'}`} />

                        <svg
                            className={`w-12 h-12 relative z-10 drop-shadow-md ${theme === 'dark' ? 'text-white' : 'text-blue-500'}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>

                </div>

                {/* Title with Gradient */}
                <div className="space-y-4">
                    <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {theme === 'dark' ? (
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-bee-400 via-orange-400 to-bee-500 animate-gradient">
                                BeeBot AI
                            </span>
                        ) : (
                            <span className="text-gray-900">
                                Good Morning, <span className="text-blue-600">Judha</span>
                            </span>
                        )}
                    </h1>

                    <p className={`text-lg md:text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-light max-w-2xl mx-auto leading-relaxed`} >
                        {theme === 'dark' ? 'Your intelligent assistant powered by advanced AI' : 'How can I assist you today?'}
                    </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className={`group relative px-4 py-2 rounded-full ${theme === 'dark' ? 'glass-card border-white/5' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'} transition-all duration-300 cursor-default hover:-translate-y-1`}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-full transition-opacity duration-300`} />
                                <div className="flex items-center space-x-2 relative z-10">
                                    <Icon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-bee-400' : 'text-blue-500'} transition-transform duration-300`} />
                                    <span className={`text-xs font-medium tracking-wide ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{feature.text}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Status Indicator */}
                <div className="pt-6">
                    {status === 'connected' && (
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Connected & Ready</span>
                        </div>
                    )}

                    {status === 'connecting' && (
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Connecting...</span>
                        </div>
                    )}

                    {status === 'disconnected' && (
                        <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Backend disconnected. Is <code className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">uvicorn</code> running?</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Connection Error</span>
                        </div>
                    )}
                </div>

                {/* Call to Action */}
                <div className="pt-4 space-y-3">
                    <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} text-sm`}>
                        Start typing below to begin your conversation
                    </p>
                    <div className={`flex items-center justify-center space-x-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} text-xs`}>
                        <div className={`w-1 h-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'} rounded-full animate-bounce`} />
                        <div className={`w-1 h-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }} />
                        <div className={`w-1 h-1 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className={`absolute bottom-0 left-0 right-0 h-32 ${theme === 'dark' ? 'bg-gradient-to-t from-gray-950' : 'bg-gradient-to-t from-gray-50'} to-transparent pointer-events-none`} />
        </div>
    );
}
