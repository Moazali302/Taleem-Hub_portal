import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

export type FeeStatus = 'Paid' | 'Partial' | 'Overdue' | 'Pending';
export type FeePaymentMethod = 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa';

export interface FeeSummary {
  month: string;
  collected: number;
  pending: number;
  overdue_count: number;
  vouchers_sent: number;
}

export interface FeeRecord {
  id: string;
  studentName: string;
  studentId?: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string | null;
  voucherSent: boolean | null;
  status: FeeStatus;
}

export interface FeePage {
  items: FeeRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeeListQuery {
  month: string;
  status: FeeStatus | '';
  search: string;
  page: number;
  limit: number;
}

export interface FeePayment {
  id: string;
  amount: number;
  method: string;
  paidAt: string | null;
  reference?: string;
}

export interface FeePaymentResult {
  fee: FeeRecord | null;
}

export class InvalidFeeResponseError extends Error {}

@Injectable({ providedIn: 'root' })
export class AdminFeesService {
  constructor(private readonly api: ApiService) {}

  getSummary(month: string): Observable<ApiResponse<FeeSummary>> {
    const params = new HttpParams().set('month', month);
    return this.api.get<FeeSummary>(API.FEES.SUMMARY, params);
  }

  getFees(query: FeeListQuery): Observable<ApiResponse<FeePage>> {
    const params = new HttpParams()
      .set('month', query.month)
      .set('status', query.status)
      .set('search', query.search)
      .set('page', Math.max(1, query.page))
      .set('limit', Math.min(100, Math.max(1, query.limit)));

    return this.api.get<unknown>(API.FEES.LIST, params).pipe(
      map((response): ApiResponse<FeePage> => ({
        ...response,
        data: feePageFrom(response.data),
      })),
    );
  }

  submitPayment(
    id: string,
    amount: number,
    method: FeePaymentMethod,
  ): Observable<ApiResponse<FeePaymentResult>> {
    return this.api.post<unknown>(API.FEES.PAYMENTS(id), { amount, method }).pipe(
      map((response): ApiResponse<FeePaymentResult> => ({
        ...response,
        data: { fee: updatedFeeFrom(response.data) },
      })),
    );
  }

  getPaymentHistory(id: string): Observable<ApiResponse<FeePayment[]>> {
    return this.api.get<unknown>(API.FEES.PAYMENTS(id)).pipe(
      map((response): ApiResponse<FeePayment[]> => ({
        ...response,
        data: paymentRowsFrom(response.data),
      })),
    );
  }

  generateVouchers(month: string): Observable<ApiResponse<unknown>> {
    return this.api.post<unknown>(API.FEES.GENERATE_VOUCHERS, { month });
  }
}

function feePageFrom(value: unknown): FeePage {
  if (!isRecord(value) || !Array.isArray(value['items']) || !value['items'].every(isRecord)) {
    throw new InvalidFeeResponseError('The fees response does not contain a valid page of records.');
  }

  const total = finiteNumber(value['total']);
  const page = finiteNumber(value['page']);
  const limit = finiteNumber(value['limit']);
  const totalPages = finiteNumber(value['totalPages']);
  if (total === undefined || page === undefined || limit === undefined || totalPages === undefined) {
    throw new InvalidFeeResponseError('The fees response is missing pagination details.');
  }

  return {
    items: value['items'].map(feeRecordFrom),
    total,
    page,
    limit,
    totalPages,
  };
}

function feeRecordFrom(row: Record<string, unknown>): FeeRecord {
  const student = isRecord(row['student']) ? row['student'] : {};
  const studentClass = isRecord(student['class']) ? student['class'] : {};
  const classInfo = isRecord(row['class']) ? row['class'] : studentClass;
  const id = nonEmptyString(row['id']) ?? nonEmptyString(row['fee_id']);
  const studentName =
    nonEmptyString(row['student_name']) ??
    nonEmptyString(student['name']) ??
    nonEmptyString(student['student_name']) ??
    nonEmptyString(student['full_name']);
  const amountDue = firstNumber(
    row['amount_due'],
    row['net_payable'],
    row['amount'],
    row['fee_amount'],
    row['total_amount'],
  );
  const amountPaid = firstNumber(
    row['amount_paid'],
    row['paid_amount'],
    row['total_paid'],
    row['paid'],
  );
  const status = feeStatusFrom(row['status']);
  const dueDate = row['due_date'];
  const voucherSent = row['voucher_sent'];

  if (
    !id ||
    !studentName ||
    amountDue === undefined ||
    amountPaid === undefined ||
    !status ||
    (dueDate !== null && typeof dueDate !== 'string') ||
    typeof voucherSent !== 'boolean'
  ) {
    throw new InvalidFeeResponseError(
      'A fee record is missing its ID, student, amounts, due date, voucher state, or API-calculated status.',
    );
  }

  return {
    id,
    studentName,
    studentId:
      nonEmptyString(row['student_id']) ??
      nonEmptyString(student['student_id']) ??
      nonEmptyString(student['id']),
    className:
      nonEmptyString(row['class_name']) ??
      nonEmptyString(student['class_name']) ??
      nonEmptyString(classInfo['class_name']) ??
      nonEmptyString(classInfo['name']) ??
      '—',
    amountDue,
    amountPaid,
    dueDate,
    voucherSent,
    status,
  };
}

function updatedFeeFrom(value: unknown): FeeRecord | null {
  if (!isRecord(value)) return null;

  const candidates = [
    value['fee'],
    value['updated_fee'],
    value['updatedFee'],
    value['data'],
    value,
  ];
  for (const candidate of candidates) {
    if (!isRecord(candidate) || !candidate['status']) continue;
    try {
      return feeRecordFrom(candidate);
    } catch (error) {
      if (!(error instanceof InvalidFeeResponseError)) throw error;
    }
  }
  return null;
}

function paymentRowsFrom(value: unknown): FeePayment[] {
  let rows: unknown = value;
  if (isRecord(value)) rows = value['items'] ?? value['payments'];
  if (!Array.isArray(rows) || !rows.every(isRecord)) {
    throw new InvalidFeeResponseError('The payment history response is not a valid collection.');
  }

  return rows.map((row) => {
    const id = nonEmptyString(row['id']) ?? nonEmptyString(row['payment_id']);
    const amount = firstNumber(row['amount'], row['paid_amount']);
    const method = nonEmptyString(row['method']) ?? nonEmptyString(row['payment_method']);
    if (!id || amount === undefined || !method) {
      throw new InvalidFeeResponseError('A payment history entry is missing its ID, amount, or method.');
    }

    return {
      id,
      amount,
      method,
      paidAt:
        nonEmptyString(row['paid_at']) ??
        nonEmptyString(row['received_at']) ??
        nonEmptyString(row['payment_date']) ??
        nonEmptyString(row['paymentDate']) ??
        nonEmptyString(row['created_at']) ??
        nonEmptyString(row['date']) ??
        null,
      reference: nonEmptyString(row['reference']) ?? nonEmptyString(row['transaction_id']),
    };
  });
}

function feeStatusFrom(value: unknown): FeeStatus | undefined {
  return value === 'Paid' || value === 'Partial' || value === 'Overdue' || value === 'Pending'
    ? value
    : undefined;
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const parsed = finiteNumber(value);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
}

function finiteNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim() || undefined
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
