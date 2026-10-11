import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  Settings,
  LogOut,
  Mail,
  Layers,
} from 'lucide-react';
import { WorkspaceSwitcher } from '../workspace/WorkspaceSwitcher.js';
import { useAuth } from '../../context/AuthContext.js';

export const Sidebar: React.FC<{ onCloseMobile?: () => void }> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Projects', path: '/app/projects', icon: FolderKanban },
    { name: 'My Tasks', path: '/app/tasks', icon: CheckSquare },
    { name: 'Team', path: '/app/team', icon: Users },
    { name: 'Notifications', path: '/app/notifications', icon: Bell },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <Layers className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">Kairo</span>
        <span className="ml-auto rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
          PRO
        </span>
      </div>

      {/* Workspace Switcher */}
      <div className="p-4 border-b border-slate-100">
        <WorkspaceSwitcher />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="border-t border-slate-200 p-3 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2 p-1">
          <NavLink
            to="/app/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 truncate hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white uppercase shrink-0">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="truncate">
              <div className="truncate text-xs font-semibold text-slate-900">{user?.name}</div>
              <div className="truncate text-[10px] text-slate-500">{user?.email}</div>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
