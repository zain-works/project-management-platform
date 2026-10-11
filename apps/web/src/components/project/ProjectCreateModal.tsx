import React, { useState } from 'react';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Textarea } from '../ui/Textarea.js';
import { Select } from '../ui/Select.js';
import { Button } from '../ui/Button.js';
import { api } from '../../api/client.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { ProjectStatus } from '@pmp/shared';

export const ProjectCreateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}> = ({ isOpen, onClose, onProjectCreated }) => {
  const { currentWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.ACTIVE);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !name.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.projects.create(currentWorkspace.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      setName('');
      setDescription('');
      setStartDate('');
      setDueDate('');
      if (onProjectCreated) onProjectCreated(data.project);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: ProjectStatus.ACTIVE, label: 'Active' },
    { value: ProjectStatus.PLANNING, label: 'Planning' },
    { value: ProjectStatus.PAUSED, label: 'Paused' },
    { value: ProjectStatus.COMPLETED, label: 'Completed' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" description="Projects organize tasks and workflows for your team.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
        <Input
          label="Project Name"
          placeholder="e.g. Mobile App Redesign"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          label="Description"
          placeholder="What is the goal of this project?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          options={statusOptions}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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
          <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
