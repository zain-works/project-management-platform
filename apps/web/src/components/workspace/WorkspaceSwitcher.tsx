import React, { useState } from 'react';
import { ChevronsUpDown, Plus, Check, Briefcase } from 'lucide-react';
import { useWorkspace, WorkspaceItem } from '../../context/WorkspaceContext.js';
import { WorkspaceCreateModal } from './WorkspaceCreateModal.js';
import { RoleBadge } from '../ui/Badge.js';

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, currentWorkspace, switchWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2 text-left text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white uppercase">
              {currentWorkspace ? currentWorkspace.name.substring(0, 2) : 'WS'}
            </div>
            <div className="truncate">
              <div className="truncate text-sm font-medium leading-none text-slate-900">
                {currentWorkspace?.name || 'Select Workspace'}
              </div>
              {currentWorkspace && (
                <div className="mt-1 text-[11px] text-slate-500 font-normal">
                  {currentWorkspace.memberCount} member{currentWorkspace.memberCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Workspaces
              </div>
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{ws.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RoleBadge role={ws.membershipRole} />
                      {currentWorkspace?.id === ws.id && <Check className="h-4 w-4 text-brand-600 shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-1.5 border-t border-slate-100 pt-1.5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <WorkspaceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};
