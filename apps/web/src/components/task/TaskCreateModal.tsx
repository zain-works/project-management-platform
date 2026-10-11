import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Textarea } from '../ui/Textarea.js';
import { Select } from '../ui/Select.js';
import { Button } from '../ui/Button.js';
import { api } from '../../api/client.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { TaskStatus, TaskPriority } from '@pmp/shared';

export const TaskCreateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  defaultStatus?: TaskStatus;
  onTaskCreated?: (task: any) => void;
}> = ({ isOpen, onClose, projectId: initialProjectId, defaultStatus, onTaskCreated }) => {
  const { currentWorkspace } = useWorkspace();
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProjectId) {
      setProjectId(initialProjectId);
    }
    if (defaultStatus) {
      setStatus(defaultStatus);
    }
  }, [initialProjectId, defaultStatus, isOpen]);

  useEffect(() => {
    if (currentWorkspace && isOpen) {
      // Load projects if not locked to one
      if (!initialProjectId) {
        api.projects.list(currentWorkspace.id).then((res) => {
          setProjects(res.projects || []);
          if (res.projects?.length > 0 && !projectId) {
            setProjectId(res.projects[0].id);
          }
        });
      }
      // Load workspace members for assignee picker
      api.workspaces.listMembers(currentWorkspace.id).then((res) => {
        setMembers(res.members || []);
      });
    }
  }, [currentWorkspace, isOpen, initialProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.tasks.create(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      setTitle('');
      setDescription('');
      setAssigneeId('');
      setDueDate('');
      if (onTaskCreated) onTaskCreated(data.task);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: TaskStatus.BACKLOG, label: 'Backlog' },
    { value: TaskStatus.TODO, label: 'Todo' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.IN_REVIEW, label: 'In Review' },
    { value: TaskStatus.DONE, label: 'Done' },
  ];

  const priorityOptions = [
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.URGENT, label: 'Urgent' },
  ];

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m.user.id, label: m.user.name })),
  ];

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task" description="Add a new task to your team backlog or board.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

        {!initialProjectId && (
          <Select
            label="Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projectOptions}
            required
          />
        )}

        <Input
          label="Task Title"
          placeholder="e.g. Implement OAuth 2.0 PKCE flow"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Provide context, acceptance criteria, or design notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={statusOptions}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={priorityOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            options={memberOptions}
          />
          <Input
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!title.trim() || !projectId}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
