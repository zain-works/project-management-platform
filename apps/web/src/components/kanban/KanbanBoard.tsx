import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn.js';
import { TaskDetailModal } from '../task/TaskDetailModal.js';
import { TaskCreateModal } from '../task/TaskCreateModal.js';
import { api } from '../../api/client.js';
import { TaskStatus, TaskPriority } from '@pmp/shared';
import { Filter, Search, Plus } from 'lucide-react';
import { Button } from '../ui/Button.js';

export interface KanbanBoardProps {
  projectId: string;
  tasks: any[];
  members: any[];
  onTasksChanged: () => void;
}

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: TaskStatus.BACKLOG, title: 'Backlog' },
  { status: TaskStatus.TODO, title: 'To Do' },
  { status: TaskStatus.IN_PROGRESS, title: 'In Progress' },
  { status: TaskStatus.IN_REVIEW, title: 'In Review' },
  { status: TaskStatus.DONE, title: 'Done' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  tasks: initialTasks,
  members,
  onTasksChanged,
}) => {
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createModalStatus, setCreateModalStatus] = useState<TaskStatus | null>(null);

  // Filters
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Keep local state in sync when parent props update
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.tasks.updateStatus(draggableId, newStatus, destination.index * 1000);
      onTasksChanged();
    } catch {
      // Rollback optimistic update
      setTasks(previousTasks);
      alert('Failed to update task status on the server. Change was rolled back.');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterAssignee !== 'ALL') {
      if (filterAssignee === 'UNASSIGNED' && t.assigneeId !== null) return false;
      if (filterAssignee !== 'UNASSIGNED' && t.assigneeId !== filterAssignee) return false;
    }
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Kanban Filter & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 w-44 sm:w-56"
            />
          </div>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.LOW}>Low</option>
          </select>
        </div>

        <Button size="sm" onClick={() => setCreateModalStatus(TaskStatus.TODO)}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Board Horizontal Scroll Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max items-start">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                tasks={filteredTasks.filter((t) => t.status === col.status)}
                onTaskClick={(id) => setSelectedTaskId(id)}
                onAddTask={(status) => setCreateModalStatus(status)}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={onTasksChanged}
        onTaskDeleted={onTasksChanged}
      />

      {/* Create Task Modal */}
      <TaskCreateModal
        isOpen={!!createModalStatus}
        onClose={() => setCreateModalStatus(null)}
        projectId={projectId}
        defaultStatus={createModalStatus || TaskStatus.TODO}
        onTaskCreated={onTasksChanged}
      />
    </div>
  );
};
