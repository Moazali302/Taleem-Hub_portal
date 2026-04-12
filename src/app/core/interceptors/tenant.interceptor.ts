import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';
import { StorageService } from '../services/storage.service';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  constructor(private storage: StorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tenantId = this.storage.getItem<string>(APP_CONSTANTS.STORAGE_KEYS.TENANT);

    if (tenantId) {
      request = request.clone({
        setHeaders: {
          'X-Tenant-ID': tenantId
        }
      });
    }

    return next.handle(request);
  }
}
