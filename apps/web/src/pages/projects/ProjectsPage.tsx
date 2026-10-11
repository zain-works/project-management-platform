import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Search, CheckCircle2, Users, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { CardSkeleton } from '../../components/ui/Skeleton.js';
import { ProjectCreateModal } from '../../components/project/ProjectCreateModal.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { api } from '../../api/client.js';
import { ProjectStatus } from '@pmp/shared';

export const ProjectsPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProjects = async () => {
    if (!currentWorkspace) return;
    try {
      setIsLoading(true);
      const res = await api.projects.list(currentWorkspace.id, {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery || undefined,
      });
      setProjects(res.projects || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentWorkspace, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage projects, roadmaps, and progress for {currentWorkspace?.name}.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value={ProjectStatus.ACTIVE}>Active</option>
            <option value={ProjectStatus.PLANNING}>Planning</option>
            <option value={ProjectStatus.PAUSED}>Paused</option>
            <option value={ProjectStatus.COMPLETED}>Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first project to start organizing tasks on Kanban boards."
          actionText="Create Project"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-100">
                    {p.status}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    <span>{p.membersCount}</span>
                  </div>
                </div>

                <Link
                  to={`/app/projects/${p.id}/board`}
                  className="block text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors"
                >
                  {p.name}
                </Link>

                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-slate-800">{p.progressPercentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-300"
                    style={{ width: `${p.progressPercentage}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {p.completedTasks}/{p.totalTasks} Tasks Completed
                  </span>
                  <Link
                    to={`/app/projects/${p.id}/board`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
                  >
                    Open Board
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default ProjectsPage;
