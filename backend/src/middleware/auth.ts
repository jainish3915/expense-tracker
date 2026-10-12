import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config';
import { AuthRequest, SessionUser } from '../types';
import { Role } from '@prisma/client';

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.signedCookies?.session;
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in again.' } });
  try { req.user = jwt.verify(token, env.JWT_SECRET) as SessionUser; next(); }
  catch { res.clearCookie('session'); return res.status(401).json({ error: { code: 'INVALID_SESSION', message: 'Your session has expired.' } }); }
}

export const requireRoles = (...roles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission for this resource.' } });
  next();
};

export function requireCsrf(req: AuthRequest, res: Response, next: NextFunction) {
  const cookie = req.cookies?.csrf;
  const header = req.get('x-csrf-token');
  if (!cookie || !header || cookie !== header) return res.status(403).json({ error: { code: 'CSRF_INVALID', message: 'CSRF token missing or invalid.' } });
  next();
}
