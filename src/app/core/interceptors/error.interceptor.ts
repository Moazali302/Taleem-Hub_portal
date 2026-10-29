import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { API } from '../constants/api.constants';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toastService: ToastService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Silent session restore (page load / guard) failing with 401 just means "not logged in" — no toast.
        if (error.status === 401 && request.url.includes(API.AUTH.REFRESH_TOKEN)) {
          return throwError(() => error);
        }

        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else {
          errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        switch (error.status) {
          case 400: this.toastService.error('Bad Request: ' + errorMessage); break;
          case 401: this.toastService.error('Unauthorized: ' + errorMessage); break;
          case 403: this.toastService.error('Forbidden: ' + errorMessage); break;
          case 404: this.toastService.error('Not Found: ' + errorMessage); break;
          case 500: this.toastService.error('Server Error: ' + errorMessage); break;
          default: this.toastService.error(errorMessage);
        }

        return throwError(() => error);
      })
    );
  }
}