import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { API } from '../constants/api.constants';
import { ApiResponse } from '../models/api-response.model';
import {
  AssignPackagePayload,
  BillingCycle,
  SubscriptionListPlan,
  SubscriptionPlan,
  SubscriptionListItem,
} from '../models/subscription.model';

type SubscriptionPackageApiItem = Omit<
  SubscriptionListItem,
  'id' | 'plan' | 'billing_cycle' | 'expires_at' | 'status'
> & {
  id?: number;
  plan: string;
  billing_cycle: string;
  expires?: string | null;
  expires_at?: string | null;
  end_date?: string | null;
  status?: string | null;
  subscription_status?: string | null;
};

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  constructor(private readonly api: ApiService) {}

  getSubscriptions(): Observable<ApiResponse<SubscriptionListItem[]>> {
    return this.api.get<unknown>(API.SUPER_ADMIN.GET_ALL_PACKAGES).pipe(
      map((response) => {
        const items = this.extractPackageItems(response.data);
        return {
          ...response,
          data: items.map((item) => ({
            ...item,
            id: item.id ?? item.school_id,
            plan: this.toUiPlan(item.plan),
            billing_cycle: this.toUiBillingCycle(item.billing_cycle),
            expires_at: item.expires ?? item.expires_at ?? item.end_date ?? undefined,
            status: item.status ?? item.subscription_status ?? undefined,
          })),
        };
      }),
    );
  }

  assignPackage(payload: AssignPackagePayload): Observable<ApiResponse<unknown>> {
    const apiPayload = {
      ...payload,
      plan: payload.plan === 'advanced' ? 'advance' : payload.plan,
      billing_cycle: payload.billing_cycle === 'annual' ? 'yearly' : payload.billing_cycle,
    };

    return this.api.patch<unknown>(API.SUPER_ADMIN.UPDATE_PACKAGE, apiPayload);
  }

  private extractPackageItems(data: unknown): SubscriptionPackageApiItem[] {
    let value = data;

    for (let depth = 0; depth < 3; depth += 1) {
      if (Array.isArray(value)) {
        return value as SubscriptionPackageApiItem[];
      }

      if (!value || typeof value !== 'object') {
        break;
      }

      const record = value as Record<string, unknown>;
      if (Array.isArray(record['items'])) {
        return record['items'] as SubscriptionPackageApiItem[];
      }

      value = record['data'];
    }

    throw new Error('GetAllPackages response did not contain a package list.');
  }

  private toUiPlan(plan: string): SubscriptionListPlan {
    const normalizedPlan = plan.trim().toLowerCase();
    if (normalizedPlan === 'advance') {
      return 'advanced';
    }

    if (normalizedPlan === 'free_trial') {
      return normalizedPlan;
    }

    if (normalizedPlan === 'basic' || normalizedPlan === 'advanced' || normalizedPlan === 'premium') {
      return normalizedPlan;
    }

    throw new Error(`Unsupported subscription plan received from API: ${plan}`);
  }

  private toUiBillingCycle(billingCycle: string): BillingCycle {
    const normalizedBillingCycle = billingCycle.trim().toLowerCase();
    if (normalizedBillingCycle === 'yearly') {
      return 'annual';
    }

    if (normalizedBillingCycle === 'monthly' || normalizedBillingCycle === 'annual') {
      return normalizedBillingCycle;
    }

    throw new Error(`Unsupported billing cycle received from API: ${billingCycle}`);
  }
}
