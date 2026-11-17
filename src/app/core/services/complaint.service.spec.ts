import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComplaintsService } from './complaint.service';
import { Complaint } from '../models/Complaint.model';

const COMPLAINT: Complaint = {
  id: '54e00d31-85d1-4376-812f-382a45e7910a',
  school: { id: 10, name: 'School Name' },
  subject: 'Complaint subject',
  description: 'Complaint details',
  raisedBy: { id: 55, name: 'Admin Name' },
  priority: 'HIGH',
  status: 'OPEN',
  remarks: null,
  createdAt: '2026-10-24T09:20:00.000Z',
  updatedAt: '2026-10-24T09:20:00.000Z',
};

describe('ComplaintsService', () => {
  let service: ComplaintsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ComplaintsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends supported list filters and returns the wrapped page', () => {
    let result: unknown;
    service.getComplaints({
      page: 2,
      limit: 20,
      search: 'voucher',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      sortBy: 'updated_at',
      sortOrder: 'ASC',
    }).subscribe((response) => (result = response.data));

    const request = http.expectOne((req) => req.url.endsWith('/super-admin/complaints'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.keys().sort()).toEqual([
      'limit',
      'page',
      'priority',
      'search',
      'sortBy',
      'sortOrder',
      'status',
    ]);
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('20');
    expect(request.request.params.get('priority')).toBe('CRITICAL');
    expect(request.request.params.get('status')).toBe('IN_PROGRESS');
    expect(request.request.params.get('sortBy')).toBe('updated_at');
    expect(request.request.params.get('sortOrder')).toBe('ASC');

    const page = { items: [COMPLAINT], total: 1, page: 2, limit: 20, totalPages: 1 };
    request.flush({ success: true, message: 'Complaints loaded', data: page });
    expect(result).toEqual(page);
  });

  it('loads one complaint by its UUID', () => {
    let result: Complaint | undefined;
    service.getComplaint(COMPLAINT.id).subscribe((response) => (result = response.data));

    const request = http.expectOne((req) => req.url.endsWith(`/super-admin/complaints/${COMPLAINT.id}`));
    expect(request.request.method).toBe('GET');
    request.flush({ success: true, message: 'Complaint loaded', data: COMPLAINT });
    expect(result).toEqual(COMPLAINT);
  });

  it('patches only the editable complaint fields', () => {
    const payload = { status: 'IN_PROGRESS' as const, remarks: 'Investigating the issue.' };
    let result: Complaint | undefined;
    service.updateComplaint(COMPLAINT.id, payload).subscribe((response) => (result = response.data));

    const request = http.expectOne((req) => req.url.endsWith(`/super-admin/complaints/${COMPLAINT.id}`));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('schoolId');
    expect(request.request.body).not.toHaveProperty('tenantId');

    const updated = { ...COMPLAINT, ...payload };
    request.flush({ success: true, message: 'Complaint updated', data: updated });
    expect(result).toEqual(updated);
  });
});
