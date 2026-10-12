import { Router } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';
import { readSignature } from '../services/signatures';
const router = Router();
router.get('/:voucherId/:kind', requireAuth, async (req: AuthRequest, res, next) => { try { const voucherId = String(req.params.voucherId); const kindParam = String(req.params.kind); const kind = kindParam === 'employee' ? 'employeeSignaturePath' : kindParam === 'director' ? 'directorSignaturePath' : null; if (!kind) return res.status(404).end(); const voucher = await prisma.voucher.findUnique({ where: { id: voucherId }, select: { employeeId: true, employeeSignaturePath: true, directorSignaturePath: true } }); if (!voucher || (req.user!.role === Role.EMPLOYEE && voucher.employeeId !== req.user!.id)) return res.status(404).end(); const reference = voucher[kind]; if (!reference) return res.status(404).end(); const content = await readSignature(reference); res.type(reference.endsWith('.png') ? 'image/png' : 'image/jpeg').send(content); } catch (e) { next(e); } });
export default router;
