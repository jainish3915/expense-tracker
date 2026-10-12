import { describe, expect, it } from 'vitest';
import { Role, VoucherStatus } from '@prisma/client';
import { canApprove, canDeleteDraft, canEditDraft, canReject } from '../src/services/voucherRules';
import { canSee } from '../src/services/vouchers';
import { isCompleteDraft, nextVoucherNumber } from '../src/services/vouchers';

const draft = { employeeId: 'employee-1', status: VoucherStatus.DRAFT };
describe('voucher authorization and lifecycle rules', () => {
  it('allows only the owning employee to edit or delete a draft', () => {
    expect(canEditDraft(Role.EMPLOYEE, 'employee-1', draft)).toBe(true);
    expect(canDeleteDraft(Role.EMPLOYEE, 'employee-2', draft)).toBe(false);
    expect(canEditDraft(Role.DIRECTOR, 'employee-1', draft)).toBe(false);
    expect(canEditDraft(Role.EMPLOYEE, 'employee-1', { ...draft, status: VoucherStatus.PENDING_APPROVAL })).toBe(false);
  });
  it('allows an employee to see only their own vouchers', () => {
    expect(canSee(Role.EMPLOYEE, 'employee-1', draft)).toBe(true);
    expect(canSee(Role.EMPLOYEE, 'employee-2', draft)).toBe(false);
    expect(canSee(Role.DIRECTOR, 'employee-2', draft)).toBe(true);
  });
  it('requires a director signature and pending state for approval', () => {
    expect(canApprove({ status: VoucherStatus.PENDING_APPROVAL, directorSignaturePath: null })).toBe(false);
    expect(canApprove({ status: VoucherStatus.PENDING_APPROVAL, directorSignaturePath: 'signatures/a.jpg' })).toBe(true);
    expect(canApprove({ status: VoucherStatus.APPROVED, directorSignaturePath: 'signatures/a.jpg' })).toBe(false);
  });
  it('requires a non-empty reason and pending state for rejection', () => {
    expect(canReject({ status: VoucherStatus.PENDING_APPROVAL }, '   ')).toBe(false);
    expect(canReject({ status: VoucherStatus.PENDING_APPROVAL }, 'Missing receipt')).toBe(true);
    expect(canReject({ status: VoucherStatus.APPROVED }, 'Too late')).toBe(false);
  });
  it('does not consider an incomplete draft submission-ready', () => {
    expect(isCompleteDraft({ department: 'Finance', expenseTitle: 'Taxi', expenseDate: new Date(), voucherDate: new Date(), expenseCategory: 'Travel', expenseDescription: 'Airport transfer', amount: '100.00', employeeSignaturePath: null })).toBe(false);
    expect(isCompleteDraft({ department: 'Finance', expenseTitle: 'Taxi', expenseDate: new Date(), voucherDate: new Date(), expenseCategory: 'Travel', expenseDescription: 'Airport transfer', amount: '100.00', employeeSignaturePath: 'signatures/a.jpg' })).toBe(true);
  });
  it('uses the database sequence value instead of counting vouchers', async () => {
    let value = 0;
    const tx = { numberSequence: { upsert: async () => ({ value: ++value }) } } as never;
    const first = await nextVoucherNumber(tx);
    const second = await nextVoucherNumber(tx);
    expect(first).not.toBe(second);
    expect(first).toMatch(/^PV-\d{4}-000001$/);
    expect(second).toMatch(/^PV-\d{4}-000002$/);
  });
  it('keeps Accounts read-only through role policy', () => {
    expect(canEditDraft(Role.ACCOUNTS, 'employee-1', draft)).toBe(false);
    expect(canDeleteDraft(Role.ACCOUNTS, 'employee-1', draft)).toBe(false);
  });
});
