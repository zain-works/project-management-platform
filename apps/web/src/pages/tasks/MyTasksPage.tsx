import React, { useState, useEffect } from 'react';
import { CheckSquare, Filter, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { api } from '../../api/client.js';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { TaskDetailModal } from '../../components/task/TaskDetailModal.js';
import { TaskStatus, TaskPriority } from '@pmp/shared';

interface TaskItem {
  id: string;
  title: string;
  projectId: string;
  projectName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
}

const FILTER_TABS: Array<{ id: string; label: string; status?: TaskStatus }> = [
  { id: 'all', label: 'All Tasks' },
  { id: 'todo', label: 'To Do', status: TaskStatus.TODO },
  { id: 'in_progress', label: 'In Progress', status: TaskStatus.IN_PROGRESS },
  { id: 'in_review', label: 'In Review', status: TaskStatus.IN_REVIEW },
  { id: 'done', label: 'Done', status: TaskStatus.DONE }
];

export default function MyTasksPage() {
  const { currentWorkspace } = useWorkspace();
  
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!currentWorkspace?.id) return;
    
    setIsLoading(true);
    try {
      const response = await api.tasks.myTasks(currentWorkspace.id);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentWorkspace?.id]);

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    const tab = FILTER_TABS.find(t => t.id === activeFilter);
    return tab && task.status === tab.status;
  });

  const isOverdue = (dateString?: string | null) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-sm text-gray-500">Tasks assigned to you across all projects</p>
          </div>
          
          <Button 
            variant="outline" 
            className="text-gray-600"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            Filters
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-lg w-max border border-gray-200">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === tab.id 
                  ? 'bg-white text-brand-700 shadow-sm ring-1 ring-gray-200/50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={CheckSquare}
                title="No tasks assigned to you"
                description="You're all caught up! Enjoy your free time or check out project boards."
              />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No tasks found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Task</th>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Priority</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTasks.map(task => {
                    const overdue = isOverdue(task.dueDate) && task.status !== TaskStatus.DONE;
                    
                    return (
                      <tr 
                        key={task.id} 
                        onClick={() => setSelectedTaskId(task.id)}
                        className="group hover:bg-brand-50/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 group-hover:text-brand-700 transition-colors">
                            {task.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-500">
                            {task.projectName || 'Project'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center space-x-1.5 ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {overdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors ml-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => {
            setSelectedTaskId(null);
            fetchTasks(); // Refresh list after closing
          }}
        />
      )}
    </div>
  );
}
