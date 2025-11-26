
import React, { useMemo } from 'react';
import { Plus, MessageSquare, Settings, Box, Trash2 } from 'lucide-react';
import { ChatSession } from '../types';
import { useTheme } from '../ThemeContext';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession
}) => {
  const { theme } = useTheme();

  const groupedSessions = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: Record<string, ChatSession[]> = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    // Sort sessions by date descending (newest first)
    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sortedSessions.forEach(session => {
      const date = new Date(session.createdAt);

      if (date.toDateString() === today.toDateString()) {
        groups['Today'].push(session);
      } else if (date.toDateString() === yesterday.toDateString()) {
        groups['Yesterday'].push(session);
      } else if (date > lastWeek) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups['Older'].push(session);
      }
    });

    return groups;
  }, [sessions]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* New Chat Button - Sleek & Minimal */}
      <button
        onClick={onNewChat}
        className={`
          flex items-center justify-center gap-2 w-full py-3 px-4 mb-6 rounded-xl transition-all duration-300 group
          ${theme === 'dark'
            ? 'bg-gradient-to-r from-bee-500/90 to-orange-500/90 hover:from-bee-400 hover:to-orange-400 text-white shadow-lg shadow-bee-500/10'
            : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-900 shadow-sm hover:shadow-md'
          }
        `}
      >
        <Plus size={18} strokeWidth={2.5} className={`group-hover:rotate-90 transition-transform duration-300 ${theme === 'dark' ? 'text-white' : 'text-blue-500'}`} />
        <span className="font-medium tracking-wide text-sm">New Chat</span>
      </button>

      {/* History Section */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
        {Object.entries(groupedSessions).map(([group, groupSessions]) => (
          groupSessions.length > 0 && (
            <div key={group} className="mb-6 animate-in fade-in duration-300">
              <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 px-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {group}
              </h3>
              <div className="space-y-1">
                {groupSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group relative"
                  >
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className={`
                        w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${activeSessionId === session.id
                          ? theme === 'dark' ? 'bg-white/10 text-white' : 'bg-white shadow-sm text-blue-600 font-medium'
                          : theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <MessageSquare size={14} className={`
                        flex-shrink-0 transition-colors
                        ${activeSessionId === session.id
                          ? theme === 'dark' ? 'text-bee-400' : 'text-blue-500'
                          : theme === 'dark' ? 'text-gray-600 group-hover:text-bee-400' : 'text-gray-400 group-hover:text-blue-500'
                        }
                      `} />
                      <span className="truncate text-sm">{session.title || 'New Chat'}</span>
                    </button>

                    {/* Delete Action - Visible on Hover */}
                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-gray-700/50"
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {sessions.length === 0 && (
          <div className="text-center text-gray-600 py-10 text-sm">
            <p>No chat history.</p>
            <p>Start a new conversation!</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'} space-y-1`}>
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
          <Settings size={16} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
          <Box size={16} />
          <span className="text-sm font-medium">Models</span>
        </button>
      </div>
    </div>
  );
};
