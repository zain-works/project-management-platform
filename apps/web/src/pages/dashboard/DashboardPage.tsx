import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  FolderKanban,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton.js';
import { TaskDetailModal } from '../../components/task/TaskDetailModal.js';
import { TaskCreateModal } from '../../components/task/TaskCreateModal.js';
import { ProjectCreateModal } from '../../components/project/ProjectCreateModal.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { api } from '../../api/client.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const fetchDashboard = async () => {
    if (!currentWorkspace) {
      setError('No workspace selected. Please select a workspace to view the dashboard.');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.dashboard.get(currentWorkspace.id);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentWorkspace) {
      fetchDashboard();
    } else {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <h3 className="text-base font-bold text-red-800">Error loading dashboard</h3>
        <p className="mt-1 text-xs text-red-600">{error}</p>
        <Button size="sm" onClick={fetchDashboard} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const metrics = data?.metrics || {
    assignedTasksCount: 0,
    dueSoonTasksCount: 0,
    overdueTasksCount: 0,
    totalProjectsCount: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Here's what is happening today across <span className="font-semibold text-slate-800">{currentWorkspace?.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsCreateProjectOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
          <Button size="sm" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned to Me
            </span>
            <div className="rounded-xl bg-brand-50 p-2 text-brand-600">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {metrics.assignedTasksCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active tasks awaiting action</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Due Soon
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-600">
            {metrics.dueSoonTasksCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Due in the next 3 days</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overdue
            </span>
            <div className="rounded-xl bg-red-50 p-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-red-600">
            {metrics.overdueTasksCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Past scheduled deadline</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {metrics.totalProjectsCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across the workspace</span>
        </div>
      </div>

      {/* Two Column Layout: Left Tasks & Projects, Right Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned & Due Soon Tasks, Project Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Summary Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Projects Overview
              </h2>
              <Link
                to="/app/projects"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                View all ({data?.recentProjects?.length || 0})
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {data?.recentProjects?.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create a project to start planning sprints and Kanban boards."
                actionText="Create Project"
                onAction={() => setIsCreateProjectOpen(true)}
              />
            ) : (
              <div className="space-y-3.5">
                {data.recentProjects.map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/app/projects/${p.id}/board`}
                    className="block rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-brand-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm text-slate-900">{p.name}</div>
                      <span className="text-xs font-bold text-slate-700">
                        {p.progressPercentage}% Complete
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2.5 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all duration-300"
                        style={{ width: `${p.progressPercentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {p.completedTasks} of {p.totalTasks} tasks done
                      </span>
                      <span>{p.membersCount} member{p.membersCount !== 1 ? 's' : ''}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Assigned & Due Soon Tasks List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Tasks Assigned to You
              </h2>
              <Link
                to="/app/tasks"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                All My Tasks
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {data?.assignedTasks?.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="You're all caught up!"
                description="No pending tasks are currently assigned to you."
                actionText="Create Task"
                onAction={() => setIsCreateTaskOpen(true)}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {data.assignedTasks.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-900 truncate">
                          {t.title}
                        </span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                        Project: {t.project?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {t.dueDate && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {new Date(t.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Workspace Activity
            </h2>
          </div>

          {data?.recentActivity?.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No recent activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3.5">
              {data.recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold uppercase shrink-0 ring-1 ring-slate-200 text-[11px]">
                    {log.actor?.name ? log.actor.name[0] : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-800">
                      <span className="font-semibold text-slate-900">
                        {log.actor?.name || 'A team member'}
                      </span>{' '}
                      {log.actionType.toLowerCase().replace(/_/g, ' ')}
                    </p>
                    {log.metadata?.taskTitle && (
                      <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                        "{log.metadata.taskTitle}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={fetchDashboard}
        onTaskDeleted={fetchDashboard}
      />
      <TaskCreateModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={fetchDashboard}
      />
      <ProjectCreateModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={fetchDashboard}
      />
    </div>
  );
};

export default DashboardPage;
