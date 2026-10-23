export type SubscriptionPlan = 'basic' | 'advanced' | 'premium';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'expiring' | 'urgent';

/** One row of the super-admin Subscriptions listing (snake_case, like every API response). */
export interface SubscriptionListItem {
  id: number;
  school_id: number;
  school_name: string;
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
  amount: number;
  expires_at: string; // ISO date
  status: SubscriptionStatus;
}

export interface AssignPackagePayload {
  school_id: number;
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
}

export const SUBSCRIPTION_PLAN_OPTIONS: { value: SubscriptionPlan; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'premium', label: 'Premium' },
];

export const BILLING_CYCLE_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

/**
 * Placeholder price list (PKR) until pricing is finalised on the backend —
 * must stay in sync with package-pricing.constants.ts there.
 */
export const PLAN_PRICING_PKR: Record<SubscriptionPlan, Record<BillingCycle, number>> = {
  basic: { monthly: 8_000, annual: 80_000 },
  advanced: { monthly: 15_000, annual: 150_000 },
  premium: { monthly: 25_000, annual: 240_000 },
};
