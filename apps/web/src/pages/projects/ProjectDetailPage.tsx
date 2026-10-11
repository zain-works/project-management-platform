import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Kanban, Activity, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { api } from '../../api/client.js';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    Promise.all([
      api.projects.get(projectId),
      api.projects.getActivity(projectId),
    ])
      .then(([projRes, actRes]) => {
        setProject(projRes.project);
        setActivities(actRes.logs || []);
      })
      .finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading || !project) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading project...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/app/projects" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
            <span className="text-xs text-slate-500">Created by {project.createdBy?.name || 'Admin'}</span>
          </div>
        </div>

        <Link to={`/app/projects/${project.id}/board`}>
          <Button size="sm">
            <Kanban className="h-4 w-4 mr-1.5" />
            Open Kanban Board
          </Button>
        </Link>
      </div>

      {/* Progress & Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Overview</h2>
        <p className="text-sm text-slate-600">{project.description || 'No description provided.'}</p>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">Completion</span>
            <span className="font-bold text-slate-800">{project.progressPercentage}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-600"
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {project.completedTasks} completed out of {project.totalTasks} total tasks
          </span>
        </div>
      </div>

      {/* Project Activity History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Activity Timeline ({activities.length})
          </h2>
        </div>

        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No activity logged for this project yet.</p>
        ) : (
          <div className="space-y-3.5 border-l-2 border-slate-200 pl-4 ml-2">
            {activities.map((log) => (
              <div key={log.id} className="relative text-xs">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand-600 ring-4 ring-white" />
                <p className="text-slate-800">
                  <span className="font-semibold text-slate-900">{log.actor?.name || 'Member'}</span>{' '}
                  {log.actionType.toLowerCase().replace(/_/g, ' ')}
                </p>
                {log.metadata?.taskTitle && (
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    "{log.metadata.taskTitle}"
                  </p>
                )}
                <span className="text-[10px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
