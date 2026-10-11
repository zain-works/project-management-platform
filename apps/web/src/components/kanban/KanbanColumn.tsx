import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard.js';
import { TaskStatus } from '@pmp/shared';
import { Plus } from 'lucide-react';

export interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: any[];
  onTaskClick: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

const columnColors: Record<TaskStatus, { bg: string; border: string; text: string; dot: string }> = {
  [TaskStatus.BACKLOG]: { bg: 'bg-slate-100/70', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
  [TaskStatus.TODO]: { bg: 'bg-slate-100/70', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-sky-500' },
  [TaskStatus.IN_PROGRESS]: { bg: 'bg-slate-100/70', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-indigo-500' },
  [TaskStatus.IN_REVIEW]: { bg: 'bg-slate-100/70', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-amber-500' },
  [TaskStatus.DONE]: { bg: 'bg-slate-100/70', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-emerald-500' },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onTaskClick,
  onAddTask,
}) => {
  const color = columnColors[status] || columnColors[TaskStatus.TODO];

  return (
    <div className="flex flex-col w-72 sm:w-80 shrink-0 rounded-2xl bg-slate-100/80 p-3 border border-slate-200/80 max-h-[calc(100vh-14rem)]">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 py-1 mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-slate-600 shadow-xs border border-slate-200">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable Task List */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto space-y-2.5 p-1 rounded-xl transition-colors min-h-[120px] ${
              snapshot.isDraggingOver ? 'bg-brand-50/60 ring-2 ring-brand-400 ring-dashed' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                No tasks
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
