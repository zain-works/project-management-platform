import nodemailer from 'nodemailer';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export interface CapturedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: string;
  type: 'verification' | 'reset-password' | 'invitation' | 'general';
}

const capturedEmails: CapturedEmail[] = [];

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_PORT) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER && env.SMTP_PASS ? {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    } : undefined,
  });
  logger.info('SMTP transporter configured', { host: env.SMTP_HOST, port: env.SMTP_PORT });
} else {
  logger.info('No external SMTP configured; using in-memory Dev Mailbox (viewable at /api/v1/dev/emails)');
}

export const mailer = {
  async sendMail(options: { to: string; subject: string; html: string; text: string; type?: CapturedEmail['type'] }) {
    const emailRecord: CapturedEmail = {
      id: Math.random().toString(36).substring(2, 9),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      sentAt: new Date().toISOString(),
      type: options.type || 'general',
    };

    // Always record to capturedEmails for local dev inspection & testing
    capturedEmails.unshift(emailRecord);
    if (capturedEmails.length > 100) capturedEmails.pop();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: env.SMTP_FROM,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        logger.info(`Email sent via SMTP to ${options.to}: "${options.subject}"`);
      } catch (err: unknown) {
        logger.error(`Failed to send email via SMTP to ${options.to}`, { error: String(err) });
      }
    } else {
      logger.info(`[Dev Mailbox] Captured email for ${options.to}: "${options.subject}"`);
    }

    return emailRecord;
  },

  getCapturedEmails(): CapturedEmail[] {
    return [...capturedEmails];
  },

  clearCapturedEmails(): void {
    capturedEmails.length = 0;
  },

  async sendVerificationEmail(to: string, token: string, name: string) {
    const verifyUrl = `${env.CLIENT_ORIGIN}/verify-email?token=${token}`;
    return this.sendMail({
      to,
      subject: 'Verify your Kairo account email',
      text: `Hello ${name},\n\nPlease verify your email by clicking: ${verifyUrl}\n\nThis link expires in 24 hours.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to Kairo, ${name}!</h2>
          <p>Please confirm your email address by clicking the button below:</p>
          <p><a href="${verifyUrl}" style="display:inline-block; padding: 10px 20px; background-color: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
          <p style="color: #64748b; font-size: 14px;">Or copy and paste this link: ${verifyUrl}</p>
        </div>
      `,
      type: 'verification',
    });
  },

  async sendPasswordResetEmail(to: string, token: string, name: string) {
    const resetUrl = `${env.CLIENT_ORIGIN}/reset-password?token=${token}`;
    return this.sendMail({
      to,
      subject: 'Reset your Kairo password',
      text: `Hello ${name},\n\nYou requested a password reset. Reset your password by clicking: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name}, click below to set a new password:</p>
          <p><a href="${resetUrl}" style="display:inline-block; padding: 10px 20px; background-color: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
          <p style="color: #64748b; font-size: 14px;">This link expires in 1 hour. If you did not request this, you can safely ignore this message.</p>
        </div>
      `,
      type: 'reset-password',
    });
  },

  async sendWorkspaceInvitationEmail(to: string, inviterName: string, workspaceName: string, token: string) {
    const inviteUrl = `${env.CLIENT_ORIGIN}/signup?invitationToken=${token}`;
    return this.sendMail({
      to,
      subject: `You've been invited to join ${workspaceName} on Kairo`,
      text: `Hello,\n\n${inviterName} has invited you to join the "${workspaceName}" workspace on Kairo.\n\nAccept your invitation: ${inviteUrl}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Join ${workspaceName} on Kairo</h2>
          <p>${inviterName} has invited you to collaborate in their workspace.</p>
          <p><a href="${inviteUrl}" style="display:inline-block; padding: 10px 20px; background-color: #6366f1; color: #fff; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
          <p style="color: #64748b; font-size: 14px;">Link: ${inviteUrl}</p>
        </div>
      `,
      type: 'invitation',
    });
  },
};
