import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { StatusBadge, PriorityBadge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Select } from '../ui/Select.js';
import { Input } from '../ui/Input.js';
import { Textarea } from '../ui/Textarea.js';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { TaskStatus, TaskPriority } from '@pmp/shared';
import { Calendar, User, MessageSquare, Trash2, Clock, CheckCircle } from 'lucide-react';

export interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [task, setTask] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [descValue, setDescValue] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    try {
      setIsLoading(true);
      const [taskRes, commentRes] = await Promise.all([
        api.tasks.get(taskId),
        api.comments.list(taskId),
      ]);
      setTask(taskRes.task);
      setTitleValue(taskRes.task.title);
      setDescValue(taskRes.task.description || '');
      setComments(commentRes.comments || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId && isOpen) {
      fetchTaskDetails();
      if (currentWorkspace) {
        api.workspaces.listMembers(currentWorkspace.id).then((res) => {
          setMembers(res.members || []);
        });
      }
    }
  }, [taskId, isOpen, currentWorkspace]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!taskId) return;
    try {
      await api.tasks.updateStatus(taskId, newStatus);
      setTask((prev: any) => ({ ...prev, status: newStatus }));
      if (onTaskUpdated) onTaskUpdated();
    } catch {
      // ignore
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!taskId) return;
    try {
      await api.tasks.update(taskId, { priority: newPriority });
      setTask((prev: any) => ({ ...prev, priority: newPriority }));
      if (onTaskUpdated) onTaskUpdated();
    } catch {
      // ignore
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    if (!taskId) return;
    try {
      await api.tasks.updateAssignee(taskId, newAssigneeId || null);
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch {
      // ignore
    }
  };

  const handleDueDateChange = async (newDueDate: string) => {
    if (!taskId) return;
    try {
      await api.tasks.update(taskId, { dueDate: newDueDate ? new Date(newDueDate).toISOString() : null });
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch {
      // ignore
    }
  };

  const handleSaveTitle = async () => {
    if (!taskId || !titleValue.trim()) return;
    try {
      await api.tasks.update(taskId, { title: titleValue.trim() });
      setTask((prev: any) => ({ ...prev, title: titleValue.trim() }));
      setIsEditingTitle(false);
      if (onTaskUpdated) onTaskUpdated();
    } catch {
      // ignore
    }
  };

  const handleSaveDesc = async () => {
    if (!taskId) return;
    try {
      await api.tasks.update(taskId, { description: descValue.trim() });
      setTask((prev: any) => ({ ...prev, description: descValue.trim() }));
      setIsEditingDesc(false);
      if (onTaskUpdated) onTaskUpdated();
    } catch {
      // ignore
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !newComment.trim()) return;
    try {
      setIsSubmittingComment(true);
      const res = await api.comments.create(taskId, newComment.trim());
      setComments((prev) => [...prev, res.comment]);
      setNewComment('');
    } catch {
      // ignore
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.comments.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // ignore
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId || !confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await api.tasks.delete(taskId);
      if (onTaskDeleted) onTaskDeleted();
      onClose();
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task?.project?.name ? `Project: ${task.project.name}` : 'Task Details'} maxWidth="2xl">
      {isLoading || !task ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading task details...</div>
      ) : (
        <div className="space-y-6">
          {/* Title Header */}
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  className="text-lg font-semibold"
                />
                <Button size="sm" onClick={handleSaveTitle}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-bold text-slate-900 cursor-pointer hover:bg-slate-50 p-1 -ml-1 rounded transition-colors"
                title="Click to edit title"
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Quick Controls Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </span>
              <Select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                options={statusOptions}
                className="text-xs py-1 px-2"
              />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Priority
              </span>
              <Select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                options={priorityOptions}
                className="text-xs py-1 px-2"
              />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Assignee
              </span>
              <Select
                value={task.assigneeId || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                options={memberOptions}
                className="text-xs py-1 px-2"
              />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Due Date
              </span>
              <input
                type="date"
                value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description
              </span>
              {!isEditingDesc && (
                <button
                  onClick={() => setIsEditingDesc(true)}
                  className="text-xs text-brand-600 hover:text-brand-700"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingDesc ? (
              <div className="space-y-2">
                <Textarea
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  rows={4}
                  placeholder="Add a detailed description..."
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveDesc}>
                    Save Description
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDesc(true)}
                className="min-h-[60px] p-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 cursor-pointer hover:border-slate-300 transition-colors whitespace-pre-wrap"
              >
                {task.description || (
                  <span className="text-slate-400 italic">No description provided. Click to add one.</span>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                Discussion ({comments.length})
              </h3>
            </div>

            {/* Existing Comments */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 uppercase shrink-0">
                        {c.author?.name ? c.author.name[0] : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">{c.author?.name || 'Member'}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-700 whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                    {user?.id === c.authorId && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" size="sm" isLoading={isSubmittingComment} disabled={!newComment.trim()}>
                Comment
              </Button>
            </form>
          </div>

          {/* Footer Meta & Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              {task.completedAt && (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Completed {new Date(task.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <button
              onClick={handleDeleteTask}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Task
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
