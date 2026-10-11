import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Briefcase, FolderKanban, CheckSquare, ArrowRight, Check } from 'lucide-react';
import { Input } from '../../components/ui/Input.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { api } from '../../api/client.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { useAuth } from '../../context/AuthContext.js';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { switchWorkspace, refreshWorkspaces } = useWorkspace();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [workspaceName, setWorkspaceName] = useState('');
  const [createdWorkspace, setCreatedWorkspace] = useState<any>(null);

  const [projectName, setProjectName] = useState('');
  const [createdProject, setCreatedProject] = useState<any>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Create Workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.workspaces.create({ name: workspaceName.trim() });
      setCreatedWorkspace(res.workspace);
      await refreshWorkspaces();
      switchWorkspace(res.workspace);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Create Project (Optional)
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdWorkspace || !projectName.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.projects.create(createdWorkspace.id, { name: projectName.trim() });
      setCreatedProject(res.project);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Create Task (Optional)
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdProject || !taskTitle.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await api.tasks.create(createdProject.id, { title: taskTitle.trim() });
      navigate('/app', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/app', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg mb-4">
          <Layers className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome to Kairo, {user?.name}!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Let's get your team workspace set up in three quick steps.
        </p>

        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-brand-600' : 'bg-slate-200'}`} />
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-brand-600' : 'bg-slate-200'}`} />
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-brand-600' : 'bg-slate-200'}`} />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200">
          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Briefcase className="h-5 w-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">Step 1: Name your workspace</h2>
              </div>
              <p className="text-xs text-slate-500">
                This is where you and your team will collaborate on projects and tasks.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Workspace Name"
                placeholder="e.g. Acme Product Team"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                autoFocus
              />

              <Button type="submit" className="w-full mt-2" isLoading={isLoading} disabled={!workspaceName.trim()}>
                Continue
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <FolderKanban className="h-5 w-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">Step 2: Create your first project</h2>
              </div>
              <p className="text-xs text-slate-500">
                Projects hold your Kanban boards, tasks, and sprint goals.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Project Name"
                placeholder="e.g. Q4 Product Launch"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                autoFocus
              />

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(3)} className="w-1/2">
                  Skip for now
                </Button>
                <Button type="submit" className="w-1/2" isLoading={isLoading} disabled={!projectName.trim()}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <CheckSquare className="h-5 w-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">Step 3: Add your first task</h2>
              </div>
              <p className="text-xs text-slate-500">
                What's one thing you or your team need to get done this week?
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Task Title"
                placeholder="e.g. Finalize design specifications"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                autoFocus
              />

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={handleFinish} className="w-1/2">
                  Skip & Go to App
                </Button>
                <Button type="submit" className="w-1/2" isLoading={isLoading} disabled={!taskTitle.trim()}>
                  Launch Workspace
                  <Check className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
