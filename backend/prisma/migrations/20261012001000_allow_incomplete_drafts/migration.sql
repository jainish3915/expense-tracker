ALTER TABLE "Voucher" ALTER COLUMN "voucherDate" DROP NOT NULL;
ALTER TABLE "Voucher" ALTER COLUMN "expenseDate" DROP NOT NULL;
ALTER TABLE "Voucher" ALTER COLUMN "expenseTitle" DROP NOT NULL;
ALTER TABLE "Voucher" ALTER COLUMN "expenseCategory" DROP NOT NULL;
ALTER TABLE "Voucher" ALTER COLUMN "expenseDescription" DROP NOT NULL;
ALTER TABLE "Voucher" ALTER COLUMN "amount" DROP NOT NULL;
CREATE TABLE "VoucherDeletionAudit" (
  "id" TEXT NOT NULL,
  "voucherId" TEXT NOT NULL,
  "voucherNumber" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "VoucherDeletionAudit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VoucherDeletionAudit_voucherId_createdAt_idx" ON "VoucherDeletionAudit"("voucherId", "createdAt");
ALTER TABLE "VoucherDeletionAudit" ADD CONSTRAINT "VoucherDeletionAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
