import { describe, it, expect } from 'vitest';
import { TaskStatus } from '@pmp/shared';

describe('Project Progress Calculations', () => {
  function calculateProgress(tasks: { status: TaskStatus }[]): number {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    return Math.round((completed / tasks.length) * 100);
  }

  it('calculates 0% for empty tasks', () => {
    expect(calculateProgress([])).toBe(0);
  });

  it('calculates progress accurately for various task completions', () => {
    const tasks = [
      { status: TaskStatus.DONE },
      { status: TaskStatus.IN_PROGRESS },
      { status: TaskStatus.TODO },
      { status: TaskStatus.BACKLOG },
    ];
    // 1 of 4 = 25%
    expect(calculateProgress(tasks)).toBe(25);

    tasks.push({ status: TaskStatus.DONE });
    // 2 of 5 = 40%
    expect(calculateProgress(tasks)).toBe(40);

    const allDone = [{ status: TaskStatus.DONE }, { status: TaskStatus.DONE }];
    expect(calculateProgress(allDone)).toBe(100);
  });
});
