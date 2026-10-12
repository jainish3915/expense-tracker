import { Role, VoucherStatus } from '@prisma/client';
export const canEditDraft = (role: Role, userId: string, voucher: { employeeId: string; status: VoucherStatus }) => role === Role.EMPLOYEE && voucher.employeeId === userId && voucher.status === VoucherStatus.DRAFT;
export const canDeleteDraft = canEditDraft;
export const canApprove = (voucher: { status: VoucherStatus; directorSignaturePath: string | null }) => voucher.status === VoucherStatus.PENDING_APPROVAL && Boolean(voucher.directorSignaturePath);
export const canReject = (voucher: { status: VoucherStatus }, reason: string) => voucher.status === VoucherStatus.PENDING_APPROVAL && reason.trim().length > 0;
