import React from 'react';
import { TaskStatus, TaskPriority, WorkspaceRole } from '@pmp/shared';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'slate' | 'blue' | 'indigo' | 'amber' | 'emerald' | 'rose' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'sm' }) => {
  const variantStyles = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case TaskStatus.BACKLOG:
      return <Badge variant="slate">Backlog</Badge>;
    case TaskStatus.TODO:
      return <Badge variant="blue">Todo</Badge>;
    case TaskStatus.IN_PROGRESS:
      return <Badge variant="indigo">In Progress</Badge>;
    case TaskStatus.IN_REVIEW:
      return <Badge variant="amber">In Review</Badge>;
    case TaskStatus.DONE:
      return <Badge variant="emerald">Done</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  switch (priority) {
    case TaskPriority.LOW:
      return <Badge variant="slate">Low</Badge>;
    case TaskPriority.MEDIUM:
      return <Badge variant="blue">Medium</Badge>;
    case TaskPriority.HIGH:
      return <Badge variant="amber">High</Badge>;
    case TaskPriority.URGENT:
      return <Badge variant="rose">Urgent</Badge>;
    default:
      return <Badge variant="slate">{priority}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: WorkspaceRole }> = ({ role }) => {
  switch (role) {
    case WorkspaceRole.OWNER:
      return <Badge variant="purple">Owner</Badge>;
    case WorkspaceRole.ADMIN:
      return <Badge variant="indigo">Admin</Badge>;
    case WorkspaceRole.PROJECT_MANAGER:
      return <Badge variant="blue">Project Manager</Badge>;
    case WorkspaceRole.MEMBER:
      return <Badge variant="slate">Member</Badge>;
    default:
      return <Badge variant="slate">{role}</Badge>;
  }
};
