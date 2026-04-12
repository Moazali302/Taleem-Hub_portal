import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PlanGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(): boolean { return true; }
}
