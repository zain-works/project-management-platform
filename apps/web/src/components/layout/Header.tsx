import React, { useState, useEffect } from 'react';
import { Menu, Search, Plus, X, FolderKanban, CheckSquare } from 'lucide-react';
import { NotificationBell } from '../notification/NotificationBell.js';
import { Button } from '../ui/Button.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { api } from '../../api/client.js';
import { useNavigate } from 'react-router-dom';

export interface HeaderProps {
  onOpenMobileNav: () => void;
  onQuickCreateTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav, onQuickCreateTask }) => {
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ projects: any[]; tasks: any[] }>({
    projects: [],
    tasks: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || !currentWorkspace) {
      setSearchResults({ projects: [], tasks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await api.dashboard.search(currentWorkspace.id, searchQuery);
        setSearchResults(data);
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, currentWorkspace]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile Toggle & Workspace Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </span>
          <h1 className="text-sm font-bold text-slate-800 leading-none">
            {currentWorkspace?.name || 'Kairo Platform'}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="relative max-w-md w-full mx-4 hidden md:block">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search projects, tasks, or members...</span>
          </div>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Create & Notification Bell */}
      <div className="flex items-center gap-2.5">
        <Button size="sm" onClick={onQuickCreateTask} className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>

        <NotificationBell />
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setSearchOpen(false)} />
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <div
              className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center border-b border-slate-100 px-4 py-3">
                <Search className="h-4 w-4 text-slate-400 mr-2.5" />
                <input
                  type="text"
                  placeholder="Search workspace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="rounded p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-400">Searching...</div>
                ) : !searchQuery.trim() ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Type a task name, description, or project title to search.
                  </div>
                ) : searchResults.projects.length === 0 && searchResults.tasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No results found for "{searchQuery}".
                  </div>
                ) : (
                  <>
                    {searchResults.projects.length > 0 && (
                      <div className="py-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                          Projects
                        </span>
                        <div className="mt-1 space-y-1">
                          {searchResults.projects.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setSearchOpen(false);
                                navigate(`/app/projects/${p.id}`);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-slate-50 transition-colors"
                            >
                              <FolderKanban className="h-4 w-4 text-brand-600 shrink-0" />
                              <span className="font-medium text-slate-800 truncate">{p.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.tasks.length > 0 && (
                      <div className="py-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                          Tasks
                        </span>
                        <div className="mt-1 space-y-1">
                          {searchResults.tasks.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setSearchOpen(false);
                                navigate(`/app/projects/${t.projectId}/board`);
                              }}
                              className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <CheckSquare className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-800 truncate">{t.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">{t.project?.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
