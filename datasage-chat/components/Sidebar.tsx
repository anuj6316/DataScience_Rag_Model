import React from 'react';
import {
  MessageSquarePlus,
  Search,
  Library,
  Code2,
  ChevronDown,
  Moon,
  Sun,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isOpen: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isDarkMode,
  toggleTheme,
  isOpen,
  isMobileOpen,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        flex flex-col h-full bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
        fixed inset-y-0 left-0 z-50 w-72
        md:relative md:z-0
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        ${isOpen ? 'md:translate-x-0 md:w-72 md:opacity-100' : 'md:-translate-x-full md:w-0 md:opacity-0 md:overflow-hidden'}
      `}>
        {/* Inner Wrapper */}
        <div className="flex flex-col h-full w-72 p-5 min-w-[18rem]">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10 px-1 pt-1">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl rotate-3 opacity-80 blur-sm"></div>
              <div className="relative w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/20">
                A
              </div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-400 tracking-tight">
              DataSage
            </span>
          </div>

          {/* New Chat Button */}
          <button className="group flex items-center justify-center gap-2.5 w-full bg-white dark:bg-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500 text-slate-700 dark:text-white font-semibold py-3.5 px-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-indigo-500/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 mb-8">
            <MessageSquarePlus size={20} className="text-indigo-500 dark:text-white group-hover:scale-110 transition-transform duration-200" />
            <span>New chat</span>
          </button>

          {/* Main Nav */}
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-none">
            <div className="space-y-1">
              <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</div>
              <NavItem icon={<Search size={18} />} label="Search chat" />
              <NavItem icon={<Library size={18} />} label="Library" />
              <NavItem icon={<Code2 size={18} />} label="AI code" />
            </div>

            <div className="space-y-1">
              <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Folders</div>
              <NavItem icon={<Settings size={18} />} label="Settings" />
              <NavItem icon={<HelpCircle size={18} />} label="Help & FAQ" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto space-y-2 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-amber-400 transition-colors">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </div>
              <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <button className="flex items-center gap-3 w-full hover:bg-slate-100/80 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors group relative">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white dark:ring-slate-900">
                  S
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">Sophia Doe</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 truncate">Pro Plan</div>
              </div>
              <LogOut size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 ease-out font-medium text-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50">
    <span className="group-hover:scale-110 transition-transform duration-200 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
      {icon}
    </span>
    {label}
  </button>
);

export default Sidebar;