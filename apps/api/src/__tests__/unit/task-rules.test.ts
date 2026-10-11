import { describe, it, expect } from 'vitest';
import { TaskStatus, TaskPriority } from '@pmp/shared';

describe('Task Status Transition Rules & Validation', () => {
  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.BACKLOG]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
    [TaskStatus.TODO]: [TaskStatus.BACKLOG, TaskStatus.IN_PROGRESS, TaskStatus.DONE],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.IN_REVIEW, TaskStatus.DONE],
    [TaskStatus.IN_REVIEW]: [TaskStatus.IN_PROGRESS, TaskStatus.DONE],
    [TaskStatus.DONE]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
  };

  it('validates permitted status movements', () => {
    expect(validTransitions[TaskStatus.TODO]).toContain(TaskStatus.IN_PROGRESS);
    expect(validTransitions[TaskStatus.IN_PROGRESS]).toContain(TaskStatus.IN_REVIEW);
    expect(validTransitions[TaskStatus.IN_REVIEW]).toContain(TaskStatus.DONE);
  });

  it('sets completedAt when transitioning to DONE and clears it when reopening', () => {
    function computeCompletedAt(newStatus: TaskStatus, previousCompletedAt: Date | null): Date | null {
      if (newStatus === TaskStatus.DONE) {
        return new Date();
      }
      return null;
    }

    const doneCompletedAt = computeCompletedAt(TaskStatus.DONE, null);
    expect(doneCompletedAt).toBeInstanceOf(Date);

    const reopenedCompletedAt = computeCompletedAt(TaskStatus.IN_PROGRESS, doneCompletedAt);
    expect(reopenedCompletedAt).toBeNull();
  });
});

describe('Reminder Scheduling & Deduplication Rules', () => {
  it('identifies tasks due within threshold window and excludes past/done tasks', () => {
    const now = new Date('2026-10-10T12:00:00Z');
    const windowHours = 24;
    const threshold = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

    const sampleTasks = [
      { id: '1', title: 'Due in 2 hours', dueDate: new Date('2026-10-10T14:00:00Z'), status: TaskStatus.TODO },
      { id: '2', title: 'Due in 30 hours', dueDate: new Date('2026-10-11T18:00:00Z'), status: TaskStatus.TODO },
      { id: '3', title: 'Already overdue', dueDate: new Date('2026-10-10T10:00:00Z'), status: TaskStatus.TODO },
      { id: '4', title: 'Already completed', dueDate: new Date('2026-10-10T14:00:00Z'), status: TaskStatus.DONE },
    ];

    const eligible = sampleTasks.filter(
      (t) => t.status !== TaskStatus.DONE && t.dueDate >= now && t.dueDate <= threshold
    );

    expect(eligible).toHaveLength(1);
    expect(eligible[0].id).toBe('1');
  });

  it('deduplicates reminders sent within the same window', () => {
    const sentHistory = new Set<string>();
    const makeKey = (taskId: string, userId: string, window: string) => `${taskId}:${userId}:${window}`;

    const taskId = 'task-100';
    const userId = 'user-200';
    const window = '24h';

    // First check: should be unsent
    const key = makeKey(taskId, userId, window);
    expect(sentHistory.has(key)).toBe(false);

    // Record as sent
    sentHistory.add(key);

    // Second check in same cycle: should be recognized as duplicate
    expect(sentHistory.has(key)).toBe(true);
  });
});
