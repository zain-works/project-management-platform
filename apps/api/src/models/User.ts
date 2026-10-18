import { WorkspaceRole } from '@pmp/shared';

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  emailVerifiedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserModel {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly avatarUrl?: string | null;
  readonly emailVerifiedAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(attributes: UserAttributes) {
    this.id = attributes.id;
    this.name = attributes.name.trim();
    this.email = attributes.email.toLowerCase().trim();
    this.passwordHash = attributes.passwordHash;
    this.avatarUrl = attributes.avatarUrl ?? null;
    this.emailVerifiedAt = attributes.emailVerifiedAt ?? null;
    this.createdAt = attributes.createdAt ?? new Date();
    this.updatedAt = attributes.updatedAt ?? new Date();
  }

  isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null;
  }

  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatarUrl: this.avatarUrl,
      emailVerifiedAt: this.emailVerifiedAt,
      createdAt: this.createdAt,
    };
  }
}
