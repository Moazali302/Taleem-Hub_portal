import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '../models/api-response.model';

/**
 * Central HTTP client.
 *
 * Two families of methods:
 *  - get/post/patch/delete      -> backend wraps result as { data: T, ... }
 *  - getFlat/postFlat/...       -> backend returns T directly (no wrapper)
 *
 * Use the *Flat variant only for endpoints confirmed to return an
 * unwrapped body (currently: auth login & verify-otp). Everything else
 * in the app should keep using the wrapped variant.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---------- Wrapped responses: { data: T, ... } ----------

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, {
      params,
      withCredentials: true,
    });
  }

  post<T>(path: string, body: any = {}): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body, {
      withCredentials: true,
    });
  }

  patch<T>(path: string, body: any = {}): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body, {
      withCredentials: true,
    });
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`, {
      withCredentials: true,
    });
  }

  // ---------- Flat responses: T directly, no wrapper ----------

  getFlat<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params,
      withCredentials: true,
    });
  }

  postFlat<T>(path: string, body: any = {}): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      withCredentials: true,
    });
  }

  patchFlat<T>(path: string, body: any = {}): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, {
      withCredentials: true,
    });
  }

  deleteFlat<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, {
      withCredentials: true,
    });
  }
}