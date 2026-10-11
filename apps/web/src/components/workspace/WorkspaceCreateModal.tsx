import React, { useState } from 'react';
import { Modal } from '../ui/Modal.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { api } from '../../api/client.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';

export const WorkspaceCreateModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { switchWorkspace, refreshWorkspaces } = useWorkspace();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.workspaces.create({
        name: name.trim(),
        slug: slug.trim() || undefined,
      });

      await refreshWorkspaces();
      switchWorkspace(data.workspace);
      setName('');
      setSlug('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Workspace" description="Organize your team's projects and tasks.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
        <Input
          label="Workspace Name"
          placeholder="e.g. Acme Engineering"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slug) {
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30));
            }
          }}
          required
        />
        <Input
          label="URL Slug (Optional)"
          placeholder="e.g. acme-eng"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          helperText="Unique lowercase identifier for your workspace"
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={!name.trim()}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};
