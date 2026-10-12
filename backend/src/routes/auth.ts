import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../db';
import { env } from '../config';
import { AuthRequest } from '../types';
import { requireAuth } from '../middleware/auth';

const router = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) });
const cookieOptions = { httpOnly: true, signed: true, sameSite: 'lax' as const, secure: env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000, path: '/' };

router.get('/csrf', (_req, res) => { const token = crypto.randomBytes(32).toString('hex'); res.cookie('csrf', token, { httpOnly: false, sameSite: 'lax', secure: env.NODE_ENV === 'production', maxAge: cookieOptions.maxAge, path: '/' }); res.json({ csrfToken: token }); });
router.post('/login', async (req, res, next) => { try { const input = loginSchema.parse(req.body); const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } }); if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } }); const token = jwt.sign({ id: user.id, role: user.role, email: user.email, name: user.name, employeeId: user.employeeId }, env.JWT_SECRET, { expiresIn: '8h' }); res.cookie('session', token, cookieOptions); res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, employeeId: user.employeeId } }); } catch (e) { next(e); } });
router.post('/logout', (_req, res) => { res.clearCookie('session', { path: '/' }); res.clearCookie('csrf', { path: '/' }); res.status(204).send(); });
router.get('/me', requireAuth, async (req: AuthRequest, res, next) => { try { const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, role: true, department: true, employeeId: true, isActive: true } }); if (!user?.isActive) return res.status(401).json({ error: { code: 'INVALID_SESSION', message: 'Your account is inactive.' } }); res.json({ user }); } catch (e) { next(e); } });
export default router;
