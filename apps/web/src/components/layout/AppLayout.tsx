import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { TaskCreateModal } from '../task/TaskCreateModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { workspaces, isLoadingWorkspaces } = useWorkspace();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  if (isLoading || isLoadingWorkspaces) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <span className="text-xs font-medium text-slate-500">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has no workspaces, redirect to onboarding wizard!
  // Don't redirect if user is on onboarding page even after creating a workspace
  if (workspaces.length === 0 && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />;
  }

  // Don't auto-redirect from onboarding to dashboard - let user complete the flow
  if (location.pathname === '/app/onboarding') {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-10 animate-in slide-in-from-left duration-200">
            <Sidebar onCloseMobile={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onQuickCreateTask={() => setQuickCreateOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Create Task Modal */}
      <TaskCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
      />
    </div>
  );
};
