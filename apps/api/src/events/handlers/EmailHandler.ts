import { BaseDomainEvent, WorkspaceMemberInvitedPayload } from '@pmp/shared';
import { mailer } from '../../config/mailer.js';
import { logger } from '../../utils/logger.js';
import { workspaceRepository } from '../../repositories/WorkspaceRepository.js';
import { userRepository } from '../../repositories/UserRepository.js';

export async function handleEmailVerification(event: BaseDomainEvent<{ userId: string; email: string; name: string; token: string }>) {
  try {
    const { email, token, name } = event.payload;
    await mailer.sendVerificationEmail(email, token, name);
    logger.info(`Verification email sent to ${email}`, { userId: event.payload.userId });
  } catch (err) {
    logger.error('Failed to send verification email event', { error: String(err), userId: event.payload.userId, email: event.payload.email });
  }
}

export async function handleWorkspaceInvitationEmail(event: BaseDomainEvent<WorkspaceMemberInvitedPayload>) {
  try {
    const { workspaceId, invitedById, invitedEmail, token } = event.payload;
    const [workspace, inviter] = await Promise.all([
      workspaceRepository.findById(workspaceId),
      userRepository.findById(invitedById),
    ]);
    const workspaceName = workspace?.name || 'Workspace';
    const inviterName = inviter?.name || 'A team member';

    await mailer.sendWorkspaceInvitationEmail(invitedEmail, inviterName, workspaceName, token);
    logger.info(`Workspace invitation email sent to ${invitedEmail}`, { workspaceId: event.payload.workspaceId, invitedById: event.payload.invitedById });
  } catch (err) {
    logger.error('Failed to send workspace invitation email event', { error: String(err), workspaceId: event.payload.workspaceId, invitedEmail: event.payload.invitedEmail });
  }
}

