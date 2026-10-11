import { describe, it, expect } from 'vitest';
import { WorkspaceRole, hasMinimumRole } from '@pmp/shared';

describe('Role Hierarchy & Authorization Rules', () => {
  it('correctly compares Workspace roles', () => {
    // OWNER should satisfy any role
    expect(hasMinimumRole(WorkspaceRole.OWNER, WorkspaceRole.OWNER)).toBe(true);
    expect(hasMinimumRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)).toBe(true);
    expect(hasMinimumRole(WorkspaceRole.OWNER, WorkspaceRole.PROJECT_MANAGER)).toBe(true);
    expect(hasMinimumRole(WorkspaceRole.OWNER, WorkspaceRole.MEMBER)).toBe(true);

    // ADMIN
    expect(hasMinimumRole(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)).toBe(false);
    expect(hasMinimumRole(WorkspaceRole.ADMIN, WorkspaceRole.ADMIN)).toBe(true);
    expect(hasMinimumRole(WorkspaceRole.ADMIN, WorkspaceRole.PROJECT_MANAGER)).toBe(true);
    expect(hasMinimumRole(WorkspaceRole.ADMIN, WorkspaceRole.MEMBER)).toBe(true);

    // PROJECT_MANAGER
    expect(hasMinimumRole(WorkspaceRole.PROJECT_MANAGER, WorkspaceRole.ADMIN)).toBe(false);
    expect(hasMinimumRole(WorkspaceRole.PROJECT_MANAGER, WorkspaceRole.PROJECT_MANAGER)).toBe(true);
    expect(hasMinimumRole(WorkspaceRole.PROJECT_MANAGER, WorkspaceRole.MEMBER)).toBe(true);

    // MEMBER
    expect(hasMinimumRole(WorkspaceRole.MEMBER, WorkspaceRole.PROJECT_MANAGER)).toBe(false);
    expect(hasMinimumRole(WorkspaceRole.MEMBER, WorkspaceRole.ADMIN)).toBe(false);
    expect(hasMinimumRole(WorkspaceRole.MEMBER, WorkspaceRole.MEMBER)).toBe(true);
  });
});
