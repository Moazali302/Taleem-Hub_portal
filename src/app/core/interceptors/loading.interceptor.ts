import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.show();
    return next.handle(request).pipe(
      finalize(() => this.loaderService.hide())
    );
  }
}
