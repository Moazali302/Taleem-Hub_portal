import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  AnalyticsDashboardRange,
  SuperAdminAnalyticsDashboard,
} from '../models/super-admin-analytics.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PlatformAnalyticsService {
  constructor(private readonly api: ApiService) {}

  getAnalytics(
    range: AnalyticsDashboardRange = '30D',
  ): Observable<ApiResponse<SuperAdminAnalyticsDashboard>> {
    const params = new HttpParams().set('range', range);
    return this.api.get<SuperAdminAnalyticsDashboard>(API.SUPER_ADMIN.ANALYTICS, params);
  }
}