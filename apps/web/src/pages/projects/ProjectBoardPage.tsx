import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Users, Calendar, Activity } from 'lucide-react';
import { KanbanBoard } from '../../components/kanban/KanbanBoard.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { api } from '../../api/client.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';

export const ProjectBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentWorkspace } = useWorkspace();

  const [project, setProject] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjectData = async () => {
    if (!projectId || !currentWorkspace) return;
    try {
      setIsLoading(true);
      const [projRes, tasksRes, membersRes] = await Promise.all([
        api.projects.get(projectId),
        api.tasks.list(projectId),
        api.workspaces.listMembers(currentWorkspace.id),
      ]);
      setProject(projRes.project);
      setTasks(tasksRes.tasks || []);
      setMembers(membersRes.members || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId, currentWorkspace]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-96 w-80 rounded-2xl" />
          <Skeleton className="h-96 w-80 rounded-2xl" />
          <Skeleton className="h-96 w-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Project not found</h2>
        <Link to="/app/projects" className="mt-4 inline-block">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-4">
      {/* Board Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <Link
            to="/app/projects"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{project.name}</h1>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/app/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              <Activity className="h-3.5 w-3.5 mr-1" />
              Project Timeline
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <div className="flex-1 min-h-0">
        <KanbanBoard
          projectId={project.id}
          tasks={tasks}
          members={members}
          onTasksChanged={fetchProjectData}
        />
      </div>
    </div>
  );
};

export default ProjectBoardPage;
