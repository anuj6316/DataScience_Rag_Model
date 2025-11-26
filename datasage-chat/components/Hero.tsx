import React from 'react';
import { Sparkles, Edit3, Lightbulb, Compass, ArrowRight } from 'lucide-react';

interface HeroProps {
  children: React.ReactNode;
  onSuggestionClick: (text: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ children, onSuggestionClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full max-w-5xl mx-auto px-6 relative animate-in fade-in zoom-in-95 duration-700">

      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-400/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-400/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slower pointer-events-none" />

      {/* Advanced Orb Animation */}
      <div className="relative w-40 h-40 md:w-48 md:h-48 mb-12 group perspective-1000">
        <div className="relative w-full h-full transform-style-3d animate-float">

          {/* Outer Glow Field */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-[50px] animate-pulse-slow" />

          {/* Rotating Rings */}
          <div className="absolute inset-0 rounded-full border-[1px] border-indigo-400/30 border-t-transparent border-l-transparent rotate-45 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border-[1px] border-purple-400/30 border-b-transparent border-r-transparent animate-[spin_12s_linear_infinite_reverse]" />
          <div className="absolute inset-6 rounded-full border-[1px] border-pink-400/20 border-t-transparent rotate-12 animate-[spin_15s_linear_infinite]" />

          {/* Main Sphere */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white via-indigo-50 to-indigo-100 dark:from-slate-800 dark:via-slate-900 dark:to-black shadow-[inset_0_0_40px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_0_40px_rgba(99,102,241,0.2)] backdrop-blur-sm overflow-hidden border border-white/50 dark:border-slate-700/50">

            {/* Internal Liquid/Nebula Effect */}
            <div className="absolute -inset-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-20 dark:opacity-30 blur-2xl animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent dark:from-white/10 dark:to-transparent" />

            {/* Center Highlight */}
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-white/40 blur-xl rounded-full" />
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="text-center space-y-6 mb-12 max-w-3xl mx-auto z-10 relative">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          <span className="block text-2xl md:text-3xl font-semibold text-slate-500 dark:text-slate-400 mb-4 tracking-tight">Good Morning,</span>
          <span className="relative inline-block">
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x bg-[length:200%_auto]">
              Sophia Doe
            </span>
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-purple-500/50 to-pink-500/0 rounded-full blur-sm opacity-50" />
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
          I'm <span className="font-semibold text-slate-800 dark:text-slate-100">DataSage</span>. Ready to assist you with data visualization, coding, or creative brainstorming.
        </p>
      </div>

      {/* Input Area Slot */}
      <div className="w-full max-w-[46rem] mb-16 z-20 relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[2.2rem] opacity-25 blur-lg transition duration-500 group-hover:opacity-50 hidden md:block" />
        {children}
      </div>

      {/* Suggestions Grid */}
      <div className="w-full max-w-[50rem]">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Start with a template</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <SuggestionCard
            icon={<Sparkles size={22} className="text-indigo-500 dark:text-indigo-400" />}
            title="Create Image"
            subtitle="Futuristic city art"
            color="hover:border-indigo-500/50 hover:shadow-indigo-500/10 dark:hover:border-indigo-400/30"
            iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            delay="100"
            onClick={() => onSuggestionClick("Generate an image of a futuristic eco-friendly city")}
          />
          <SuggestionCard
            icon={<Edit3 size={22} className="text-pink-500 dark:text-pink-400" />}
            title="Summarize"
            subtitle="Condense reports"
            color="hover:border-pink-500/50 hover:shadow-pink-500/10 dark:hover:border-pink-400/30"
            iconBg="bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400"
            delay="200"
            onClick={() => onSuggestionClick("Summarize the key points of the latest project report")}
          />
          <SuggestionCard
            icon={<Lightbulb size={22} className="text-amber-500 dark:text-amber-400" />}
            title="Brainstorm"
            subtitle="Marketing ideas"
            color="hover:border-amber-500/50 hover:shadow-amber-500/10 dark:hover:border-amber-400/30"
            iconBg="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            delay="300"
            onClick={() => onSuggestionClick("Brainstorm ideas for a marketing campaign launching next month")}
          />
          <SuggestionCard
            icon={<Compass size={22} className="text-emerald-500 dark:text-emerald-400" />}
            title="Plan Trip"
            subtitle="Kyoto itinerary"
            color="hover:border-emerald-500/50 hover:shadow-emerald-500/10 dark:hover:border-emerald-400/30"
            iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            delay="400"
            onClick={() => onSuggestionClick("Create a 3-day travel itinerary for Kyoto, Japan")}
          />
        </div>
      </div>
    </div>
  );
};

interface SuggestionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  iconBg: string;
  delay: string;
  onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon, title, subtitle, color, iconBg, delay, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative flex flex-col gap-4 p-5 h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-slate-800/90 shadow-sm hover:shadow-lg ${color} animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards ring-1 ring-slate-900/5 dark:ring-white/5`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex justify-between items-start w-full">
      <div className={`p-3 rounded-xl shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/5 transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
        {icon}
      </div>
      <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
        <ArrowRight size={14} />
      </div>
    </div>

    <div>
      <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-[15px] mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{subtitle}</p>
    </div>
  </button>
);
