import { PrismaClient, WorkspaceRole, ProjectStatus, ProjectRole, TaskStatus, TaskPriority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
    console.warn('Skipping seed: Seeding demo users in production is disabled for security.');
    return;
  }

  console.log('Seeding development database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Users
  const alex = await prisma.user.upsert({
    where: { email: 'alex.owner@example.com' },
    update: {},
    create: {
      name: 'Alex Morgan',
      email: 'alex.owner@example.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.admin@example.com' },
    update: {},
    create: {
      name: 'Sarah Chen',
      email: 'sarah.admin@example.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const marcus = await prisma.user.upsert({
    where: { email: 'marcus.pm@example.com' },
    update: {},
    create: {
      name: 'Marcus Rivera',
      email: 'marcus.pm@example.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const elena = await prisma.user.upsert({
    where: { email: 'elena.dev@example.com' },
    update: {},
    create: {
      name: 'Elena Rostova',
      email: 'elena.dev@example.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Users seeded:', { alex: alex.email, sarah: sarah.email, marcus: marcus.email, elena: elena.email });

  // 2. Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-eng' },
    update: {},
    create: {
      name: 'Acme Product Engineering',
      slug: 'acme-eng',
      ownerId: alex.id,
    },
  });

  // 3. Workspace Memberships
  await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: alex.id } },
    update: { role: WorkspaceRole.OWNER },
    create: { workspaceId: workspace.id, userId: alex.id, role: WorkspaceRole.OWNER },
  });

  await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: sarah.id } },
    update: { role: WorkspaceRole.ADMIN },
    create: { workspaceId: workspace.id, userId: sarah.id, role: WorkspaceRole.ADMIN },
  });

  await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: marcus.id } },
    update: { role: WorkspaceRole.PROJECT_MANAGER },
    create: { workspaceId: workspace.id, userId: marcus.id, role: WorkspaceRole.PROJECT_MANAGER },
  });

  await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: elena.id } },
    update: { role: WorkspaceRole.MEMBER },
    create: { workspaceId: workspace.id, userId: elena.id, role: WorkspaceRole.MEMBER },
  });

  // 4. Projects
  let mobileProject = await prisma.project.findFirst({
    where: { workspaceId: workspace.id, name: 'Mobile App 2.0 Redesign' },
  });

  if (!mobileProject) {
    mobileProject = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Mobile App 2.0 Redesign',
        description: 'Next generation native iOS and Android application with unified design system',
        status: ProjectStatus.ACTIVE,
        createdById: marcus.id,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    });

    // Project memberships
    await prisma.projectMembership.createMany({
      data: [
        { projectId: mobileProject.id, userId: marcus.id, role: ProjectRole.MANAGER },
        { projectId: mobileProject.id, userId: elena.id, role: ProjectRole.CONTRIBUTOR },
        { projectId: mobileProject.id, userId: sarah.id, role: ProjectRole.CONTRIBUTOR },
      ],
      skipDuplicates: true,
    });
  }

  let cloudProject = await prisma.project.findFirst({
    where: { workspaceId: workspace.id, name: 'Cloud Infrastructure Migration' },
  });

  if (!cloudProject) {
    cloudProject = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Cloud Infrastructure Migration',
        description: 'Migrating self-hosted workloads to managed multi-region clusters',
        status: ProjectStatus.ACTIVE,
        createdById: sarah.id,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.projectMembership.createMany({
      data: [
        { projectId: cloudProject.id, userId: sarah.id, role: ProjectRole.MANAGER },
        { projectId: cloudProject.id, userId: elena.id, role: ProjectRole.CONTRIBUTOR },
      ],
      skipDuplicates: true,
    });
  }

  // 5. Tasks for Mobile App Project
  const taskCount = await prisma.task.count({ where: { projectId: mobileProject.id } });
  if (taskCount === 0) {
    const tasksData = [
      {
        projectId: mobileProject.id,
        title: 'Architect biometric authentication flow (FaceID / TouchID)',
        description: 'Design the fallback pattern and secure keychain storage for refresh tokens.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assigneeId: elena.id,
        createdById: marcus.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        position: 1000,
      },
      {
        projectId: mobileProject.id,
        title: 'Implement offline-first sync cache with SQLite',
        description: 'Ensure queued mutation replay happens when the device reconnects to network.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        assigneeId: elena.id,
        createdById: marcus.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due soon
        position: 1000,
      },
      {
        projectId: mobileProject.id,
        title: 'Dark mode theme tokens and asset color review',
        description: 'Review contrast ratios for WCAG AA compliance across all UI components.',
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.MEDIUM,
        assigneeId: sarah.id,
        createdById: marcus.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        position: 1000,
      },
      {
        projectId: mobileProject.id,
        title: 'Push notifications deep linking integration',
        description: 'Handle background payload parsing and direct navigation to task details.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        assigneeId: elena.id,
        createdById: marcus.id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
        position: 1000,
      },
      {
        projectId: mobileProject.id,
        title: 'App Store submission checklist & privacy manifests',
        description: 'Collect third-party SDK privacy declarations for iOS 18 compliance.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.LOW,
        assigneeId: null,
        createdById: marcus.id,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        position: 1000,
      },
      {
        projectId: mobileProject.id,
        title: 'In-app crash analytics & breadcrumb logging',
        description: 'Integrate Sentry SDK with breadcrumbs on network errors.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeId: marcus.id,
        createdById: alex.id,
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        position: 2000,
      },
    ];

    for (const t of tasksData) {
      const createdTask = await prisma.task.create({ data: t });

      // Add comments on in-progress task
      if (t.status === TaskStatus.IN_PROGRESS) {
        await prisma.comment.create({
          data: {
            taskId: createdTask.id,
            authorId: marcus.id,
            content: 'Elena, make sure we handle conflict resolution if the server record changed while offline.',
          },
        });

        await prisma.comment.create({
          data: {
            taskId: createdTask.id,
            authorId: elena.id,
            content: 'Implemented timestamp-based vector clocks for conflict detection. Testing edge cases now.',
          },
        });
      }
    }
  }

  // 6. Seed Notifications for Elena
  const notifCount = await prisma.notification.count({ where: { recipientId: elena.id } });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          recipientId: elena.id,
          type: NotificationType.TASK_ASSIGNED,
          title: 'Task Assigned',
          body: 'Marcus Rivera assigned you to "Implement offline-first sync cache with SQLite"',
          resourceType: 'task',
          resourceId: mobileProject.id,
          readAt: null,
        },
        {
          recipientId: elena.id,
          type: NotificationType.COMMENT_ADDED,
          title: 'New Comment',
          body: 'Marcus Rivera commented on "Implement offline-first sync cache with SQLite"',
          resourceType: 'task',
          resourceId: mobileProject.id,
          readAt: null,
        },
        {
          recipientId: elena.id,
          type: NotificationType.WORKSPACE_INVITATION,
          title: 'Welcome to Acme Product Engineering',
          body: 'Alex Morgan added you to the workspace as Member',
          resourceType: 'workspace',
          resourceId: workspace.id,
          readAt: new Date(),
        },
      ],
    });
  }

  // 7. Seed Activity Logs
  const actCount = await prisma.activityLog.count({ where: { workspaceId: workspace.id } });
  if (actCount === 0) {
    await prisma.activityLog.createMany({
      data: [
        {
          workspaceId: workspace.id,
          projectId: mobileProject.id,
          actorId: marcus.id,
          actionType: 'PROJECT_CREATED',
          resourceType: 'project',
          resourceId: mobileProject.id,
          metadata: { projectName: mobileProject.name },
        },
        {
          workspaceId: workspace.id,
          projectId: mobileProject.id,
          actorId: marcus.id,
          actionType: 'TASK_CREATED',
          resourceType: 'task',
          resourceId: mobileProject.id,
          metadata: { taskTitle: 'Architect biometric authentication flow (FaceID / TouchID)' },
        },
        {
          workspaceId: workspace.id,
          projectId: mobileProject.id,
          actorId: elena.id,
          actionType: 'TASK_STATUS_CHANGED',
          resourceType: 'task',
          resourceId: mobileProject.id,
          metadata: { oldStatus: 'IN_REVIEW', newStatus: 'DONE' },
        },
      ],
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
