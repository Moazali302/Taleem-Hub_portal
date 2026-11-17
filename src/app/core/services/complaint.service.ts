import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  Complaint,
  ComplaintListQuery,
  ComplaintPage,
  UpdateComplaintPayload,
} from '../models/Complaint.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ComplaintsService {
  constructor(private readonly api: ApiService) {}

  getComplaints(query: ComplaintListQuery): Observable<ApiResponse<ComplaintPage>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit)
      .set('sortBy', query.sortBy)
      .set('sortOrder', query.sortOrder);

    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.priority) {
      params = params.set('priority', query.priority);
    }
    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.api.get<ComplaintPage>(API.SUPER_ADMIN.COMPLAINTS, params);
  }

  getComplaint(id: string): Observable<ApiResponse<Complaint>> {
    return this.api.get<Complaint>(API.SUPER_ADMIN.COMPLAINT(id));
  }

  updateComplaint(
    id: string,
    payload: UpdateComplaintPayload,
  ): Observable<ApiResponse<Complaint>> {
    return this.api.patch<Complaint>(API.SUPER_ADMIN.COMPLAINT(id), payload);
  }
}
