import { Role } from '@prisma/client';
import { Request } from 'express';
export type SessionUser = { id: string; role: Role; email: string; name: string; employeeId: string | null };
export type AuthRequest = Request & { user?: SessionUser };
