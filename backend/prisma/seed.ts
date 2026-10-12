import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const users = [
  { name: 'Demo Employee', email: 'employee.demo@prachay.local', password: 'Employee@123', role: Role.EMPLOYEE, department: 'Finance', employeeId: 'EMP-001' },
  { name: 'Demo Employee 2', email: 'employee2.demo@prachay.local', password: 'Employee2@123', role: Role.EMPLOYEE, department: 'Finance', employeeId: 'EMP-002' },
  { name: 'Demo Director', email: 'director.demo@prachay.local', password: 'Director@123', role: Role.DIRECTOR, department: 'Leadership', employeeId: 'DIR-001' },
  { name: 'Demo Accounts', email: 'accounts.demo@prachay.local', password: 'Accounts@123', role: Role.ACCOUNTS, department: 'Accounts', employeeId: 'ACC-001' }
];

async function main() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    const { password: _password, ...profile } = user;
    await prisma.user.upsert({ where: { email: user.email }, update: { name: user.name, passwordHash, role: user.role, department: user.department, employeeId: user.employeeId, isActive: true }, create: { ...profile, passwordHash } });
  }
  await prisma.numberSequence.upsert({ where: { key: 'voucher' }, update: {}, create: { key: 'voucher', value: 0 } });
  console.log('Seeded local demo users.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
