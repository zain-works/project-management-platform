import { BaseDomainEvent, WorkspaceMemberInvitedPayload, UserRegisteredPayload } from '@pmp/shared';
import { mailer } from '../../config/mailer.js';
import { logger } from '../../utils/logger.js';

export async function handleEmailVerification(event: BaseDomainEvent<{ userId: string; email: string; name: string; token: string }>) {
  try {
    const { email, token, name } = event.payload;
    await mailer.sendVerificationEmail(email, token, name);
  } catch (err) {
    logger.error('Failed to send verification email event', { error: String(err) });
  }
}

export async function handleWorkspaceInvitationEmail(event: BaseDomainEvent<WorkspaceMemberInvitedPayload>) {
  try {
    const { invitedEmail, token } = event.payload;
    // We send invitation link with token
    await mailer.sendWorkspaceInvitationEmail(invitedEmail, 'Team Admin', 'Workspace', token);
  } catch (err) {
    logger.error('Failed to send workspace invitation email event', { error: String(err) });
  }
}
