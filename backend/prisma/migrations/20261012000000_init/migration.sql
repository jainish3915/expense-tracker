CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS');
CREATE TYPE "VoucherStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');
CREATE TABLE "User" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL, "department" TEXT NOT NULL, "employeeId" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Voucher" (
  "id" TEXT NOT NULL, "voucherNumber" TEXT NOT NULL, "voucherDate" TIMESTAMP(3) NOT NULL, "expenseDate" TIMESTAMP(3) NOT NULL,
  "department" TEXT NOT NULL, "expenseTitle" TEXT NOT NULL, "expenseCategory" TEXT NOT NULL, "expenseDescription" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL, "currency" TEXT NOT NULL DEFAULT 'INR', "employeeId" TEXT NOT NULL,
  "employeeSignaturePath" TEXT, "status" "VoucherStatus" NOT NULL DEFAULT 'DRAFT', "directorId" TEXT, "directorSignaturePath" TEXT,
  "submittedAt" TIMESTAMP(3), "approvalDate" TIMESTAMP(3), "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VoucherAuditLog" (
  "id" TEXT NOT NULL, "voucherId" TEXT NOT NULL, "actorId" TEXT NOT NULL, "action" TEXT NOT NULL,
  "previousStatus" "VoucherStatus", "newStatus" "VoucherStatus", "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "metadata" JSONB,
  CONSTRAINT "VoucherAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "NumberSequence" ("key" TEXT NOT NULL, "value" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "NumberSequence_pkey" PRIMARY KEY ("key"));
CREATE UNIQUE INDEX "User_email_key" ON "User"("email"); CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");
CREATE UNIQUE INDEX "Voucher_voucherNumber_key" ON "Voucher"("voucherNumber");
CREATE INDEX "Voucher_employeeId_status_idx" ON "Voucher"("employeeId", "status"); CREATE INDEX "Voucher_department_expenseDate_idx" ON "Voucher"("department", "expenseDate"); CREATE INDEX "Voucher_status_createdAt_idx" ON "Voucher"("status", "createdAt");
CREATE INDEX "VoucherAuditLog_voucherId_createdAt_idx" ON "VoucherAuditLog"("voucherId", "createdAt");
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VoucherAuditLog" ADD CONSTRAINT "VoucherAuditLog_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoucherAuditLog" ADD CONSTRAINT "VoucherAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
