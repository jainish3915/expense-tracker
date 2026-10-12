import 'dotenv/config';
import { z } from 'zod';
const envSchema = z.object({ DATABASE_URL: z.string().min(1), JWT_SECRET: z.string().min(32), COOKIE_SECRET: z.string().min(16), FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'), PORT: z.coerce.number().default(4000), NODE_ENV: z.enum(['development', 'test', 'production']).default('development') });
export const env = envSchema.parse(process.env);
