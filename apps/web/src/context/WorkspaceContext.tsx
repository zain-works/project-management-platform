import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.js';
import { WorkspaceRole } from '@pmp/shared';

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  membershipRole: WorkspaceRole;
  memberCount: number;
  projectCount: number;
  createdAt: string;
}

interface WorkspaceContextType {
  workspaces: WorkspaceItem[];
  currentWorkspace: WorkspaceItem | null;
  isLoadingWorkspaces: boolean;
  switchWorkspace: (workspace: WorkspaceItem) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceItem | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  const loadWorkspaces = async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setIsLoadingWorkspaces(false);
      return;
    }

    try {
      setIsLoadingWorkspaces(true);
      const data = await api.workspaces.list();
      const list: WorkspaceItem[] = data.workspaces || [];
      setWorkspaces(list);

      if (list.length > 0) {
        const savedId = localStorage.getItem('pmp_workspace_id');
        const match = list.find((w) => w.id === savedId) || list[0];
        setCurrentWorkspace(match);
        localStorage.setItem('pmp_workspace_id', match.id);
      } else {
        setCurrentWorkspace(null);
      }
    } catch {
      setWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [isAuthenticated]);

  const switchWorkspace = (workspace: WorkspaceItem) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('pmp_workspace_id', workspace.id);
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoadingWorkspaces,
        switchWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
