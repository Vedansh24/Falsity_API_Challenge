import type { Role } from '../config/roles';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};
