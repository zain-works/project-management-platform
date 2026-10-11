import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { PriorityBadge } from '../ui/Badge.js';
import { TaskPriority, TaskStatus } from '@pmp/shared';
import { Calendar, MessageSquare, Clock, AlertCircle } from 'lucide-react';

export interface KanbanCardProps {
  task: any;
  index: number;
  onClick: (taskId: string) => void;
  onQuickMove?: (taskId: string, newStatus: TaskStatus) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, index, onClick, onQuickMove }) => {
  const isOverdue =
    task.dueDate &&
    task.status !== TaskStatus.DONE &&
    new Date(task.dueDate).getTime() < Date.now();

  const isDueSoon =
    task.dueDate &&
    task.status !== TaskStatus.DONE &&
    !isOverdue &&
    new Date(task.dueDate).getTime() < Date.now() + 2 * 24 * 60 * 60 * 1000;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task.id)}
          className={`group rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-brand-300 hover:shadow-md cursor-grab active:cursor-grabbing select-none ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-brand-500 rotate-1' : ''
          }`}
        >
          {/* Priority & Status Controls */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <PriorityBadge priority={task.priority as TaskPriority} />

            {/* Assignee Avatar */}
            {task.assignee ? (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700 uppercase ring-1 ring-white"
                title={`Assigned to ${task.assignee.name}`}
              >
                {task.assignee.name ? task.assignee.name[0] : 'U'}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic">Unassigned</span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-slate-800 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
            {task.title}
          </h4>

          {/* Metadata Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-400">
            {/* Due Date Indicator */}
            {task.dueDate ? (
              <div
                className={`flex items-center gap-1 text-[11px] font-medium ${
                  isOverdue
                    ? 'text-red-600'
                    : isDueSoon
                    ? 'text-amber-600'
                    : 'text-slate-500'
                }`}
                title={isOverdue ? 'Overdue!' : isDueSoon ? 'Due soon' : 'Due date'}
              >
                {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                <span>
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ) : (
              <div />
            )}

            {/* Comments Count */}
            {task.commentsCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <MessageSquare className="h-3 w-3" />
                <span>{task.commentsCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
