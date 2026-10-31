import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import { SuperAdminDashboard } from '../models/super-admin-dashboard.model';
import { ApiService } from './api.service';

export interface SuperAdminDashboardQuery {
  activityLimit?: number;
  expiringLimit?: number;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminDashboardService {
  constructor(private readonly api: ApiService) {}

  getDashboard(
    query: SuperAdminDashboardQuery = {},
  ): Observable<ApiResponse<SuperAdminDashboard>> {
    const params = new HttpParams()
      .set('activityLimit', query.activityLimit ?? 10)
      .set('expiringLimit', query.expiringLimit ?? 10);

    return this.api.get<SuperAdminDashboard>(API.SUPER_ADMIN.DASHBOARD, params);
  }
}
