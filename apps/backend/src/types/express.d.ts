import { UserRole } from '@prisma/client';

export interface ExpressUser {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isActive: boolean;
  isTemporaryPassword: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}
