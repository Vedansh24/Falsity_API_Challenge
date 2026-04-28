export const roles = ['USER', 'ANALYST', 'REVIEWER', 'ADMIN'] as const;

export type Role = (typeof roles)[number];

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface AuthenticatedUser {
  userId: string;
  role: Role;
}
