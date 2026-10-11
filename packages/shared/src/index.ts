import { z } from 'zod';

// ==========================================
// ENUMS & CONSTANTS
// ==========================================

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  MEMBER = 'MEMBER',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectRole {
  MANAGER = 'MANAGER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER',
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  COMMENT_ADDED = 'COMMENT_ADDED',
  WORKSPACE_INVITATION = 'WORKSPACE_INVITATION',
  PROJECT_MEMBER_ADDED = 'PROJECT_MEMBER_ADDED',
}

export enum ActivityAction {
  WORKSPACE_CREATED = 'WORKSPACE_CREATED',
  WORKSPACE_UPDATED = 'WORKSPACE_UPDATED',
  MEMBER_INVITED = 'MEMBER_INVITED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  MEMBER_ROLE_UPDATED = 'MEMBER_ROLE_UPDATED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_ARCHIVED = 'PROJECT_ARCHIVED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_PRIORITY_CHANGED = 'TASK_PRIORITY_CHANGED',
  TASK_DUE_DATE_CHANGED = 'TASK_DUE_DATE_CHANGED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_DELETED = 'TASK_DELETED',
  COMMENT_ADDED = 'COMMENT_ADDED',
}

// Role hierarchy rank for authorization comparisons
export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  [WorkspaceRole.MEMBER]: 1,
  [WorkspaceRole.PROJECT_MANAGER]: 2,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.OWNER]: 4,
};

export function hasMinimumRole(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ==========================================
// VALIDATION SCHEMAS (ZOD)
// ==========================================

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(50),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
    .optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.MEMBER),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(WorkspaceRole),
});

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  position: z.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  position: z.number().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  position: z.number().optional(),
});

export const assignTaskSchema = z.object({
  assigneeId: z.string().uuid().nullable(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
});

// ==========================================
// DOMAIN EVENTS
// ==========================================

export type DomainEventType =
  | 'UserRegistered'
  | 'EmailVerificationRequested'
  | 'WorkspaceCreated'
  | 'WorkspaceMemberInvited'
  | 'WorkspaceMemberJoined'
  | 'ProjectCreated'
  | 'ProjectUpdated'
  | 'TaskCreated'
  | 'TaskAssigned'
  | 'TaskStatusChanged'
  | 'TaskPriorityChanged'
  | 'TaskDueDateChanged'
  | 'CommentAdded'
  | 'TaskCompleted'
  | 'NotificationCreated';

export interface BaseDomainEvent<T = Record<string, unknown>> {
  id: string;
  eventType: DomainEventType;
  timestamp: string;
  actorId?: string | null;
  workspaceId?: string;
  payload: T;
}

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  name: string;
}

export interface WorkspaceCreatedPayload {
  workspaceId: string;
  ownerId: string;
  name: string;
  slug: string;
}

export interface WorkspaceMemberInvitedPayload {
  workspaceId: string;
  invitationId: string;
  invitedEmail: string;
  role: WorkspaceRole;
  invitedById: string;
  token: string;
}

export interface WorkspaceMemberJoinedPayload {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}

export interface ProjectCreatedPayload {
  projectId: string;
  workspaceId: string;
  name: string;
  createdById: string;
}

export interface ProjectUpdatedPayload {
  projectId: string;
  workspaceId: string;
  changes: Record<string, unknown>;
}

export interface TaskCreatedPayload {
  taskId: string;
  projectId: string;
  workspaceId: string;
  title: string;
  createdById: string;
  assigneeId?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface TaskAssignedPayload {
  taskId: string;
  projectId: string;
  workspaceId: string;
  taskTitle: string;
  previousAssigneeId?: string | null;
  newAssigneeId: string | null;
  assignedById: string;
}

export interface TaskStatusChangedPayload {
  taskId: string;
  projectId: string;
  workspaceId: string;
  taskTitle: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  changedById: string;
  assigneeId?: string | null;
}

export interface TaskPriorityChangedPayload {
  taskId: string;
  projectId: string;
  workspaceId: string;
  taskTitle: string;
  oldPriority: TaskPriority;
  newPriority: TaskPriority;
  changedById: string;
}

export interface TaskDueDateChangedPayload {
  taskId: string;
  projectId: string;
  workspaceId: string;
  taskTitle: string;
  oldDueDate?: string | null;
  newDueDate?: string | null;
  changedById: string;
}

export interface CommentAddedPayload {
  commentId: string;
  taskId: string;
  projectId: string;
  workspaceId: string;
  taskTitle: string;
  authorId: string;
  authorName: string;
  contentSnippet: string;
}

export interface TaskCompletedPayload {
  taskId: string;
  projectId: string;
  workspaceId: string;
  taskTitle: string;
  completedById: string;
}

export interface NotificationCreatedPayload {
  notificationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
}
