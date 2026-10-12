import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Express } from 'express';

const signatureDir = path.resolve(process.cwd(), 'storage', 'private', 'signatures');
const allowed = new Map([['image/png', { ext: '.png', magic: (b: Buffer) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) }], ['image/jpeg', { ext: '.jpg', magic: (b: Buffer) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff }]]);

export async function saveSignature(file: Express.Multer.File): Promise<string> {
  const rule = allowed.get(file.mimetype);
  const originalExt = path.extname(file.originalname).toLowerCase();
  if (!rule || !rule.magic(file.buffer) || !['.png', '.jpg', '.jpeg'].includes(originalExt) || (rule.ext === '.png' && originalExt !== '.png') || (rule.ext === '.jpg' && !['.jpg', '.jpeg'].includes(originalExt))) throw Object.assign(new Error('Signature must be a valid PNG or JPEG image.'), { statusCode: 400, code: 'INVALID_SIGNATURE_FILE' });
  await fs.mkdir(signatureDir, { recursive: true });
  const filename = `${crypto.randomUUID()}${rule.ext}`;
  await fs.writeFile(path.join(signatureDir, filename), file.buffer, { flag: 'wx', mode: 0o600 });
  return `signatures/${filename}`;
}

export async function readSignature(reference: string): Promise<Buffer> {
  if (!/^signatures\/[a-f0-9-]+\.(png|jpg)$/.test(reference)) throw new Error('Invalid signature reference.');
  return fs.readFile(path.join(signatureDir, path.basename(reference)));
}
