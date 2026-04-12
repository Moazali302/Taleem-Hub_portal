import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable } from 'rxjs';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class OtpService {
  constructor(private api: ApiService) {}

  sendOtp(phone: string): Observable<ApiResponse<any>> {
    return this.api.post('/otp/send', { phone });
  }

  verifyOtp(phone: string, otp: string): Observable<ApiResponse<any>> {
    return this.api.post('/otp/verify', { phone, otp });
  }
}
