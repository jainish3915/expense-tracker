import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import voucherRoutes from './routes/vouchers';
import directorRoutes from './routes/director';
import accountsRoutes from './routes/accounts';
import signatureRoutes from './routes/signatures';
import { errorHandler, notFound } from './middleware/errors';

export const app = express();
app.set('trust proxy', 1);
app.use(helmet());
const allowedOrigins = new Set([env.FRONTEND_ORIGIN]);
const isAllowedOrigin = (origin?: string) => !origin || allowedOrigins.has(origin) || (env.NODE_ENV === 'development' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));
app.use(cors({ origin: (origin, callback) => callback(null, isAllowedOrigin(origin)), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(env.COOKIE_SECRET));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'expense-voucher-api' }));
app.get('/', (_req, res) => res.json({
  service: 'expense-voucher-api',
  status: 'ok',
  message: 'The API is running. Open the frontend at http://localhost:5173/login.',
}));
app.use('/api/v1/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/vouchers', voucherRoutes);
app.use('/api/v1/director', directorRoutes);
app.use('/api/v1/accounts', accountsRoutes);
app.use('/api/v1/signatures', signatureRoutes);
app.use(notFound);
app.use(errorHandler);
if (require.main === module) app.listen(env.PORT, () => console.log(`API listening on http://localhost:${env.PORT}`));
