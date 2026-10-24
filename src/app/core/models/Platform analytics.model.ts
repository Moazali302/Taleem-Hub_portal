import { AnalyticsPoint } from './analytics.model';
import { SubscriptionPlan } from './subscription.model';

export interface PlatformPackageShare {
  plan: SubscriptionPlan;
  percent: number; // 0-100
}

/** Platform-wide numbers behind the super-admin Analytics screen (snake_case, like every API response). */
export interface PlatformAnalytics {
  revenue_this_month: number; // PKR
  revenue_trend_percent: number;
  new_schools: number;
  new_schools_trend: number; // change vs last month
  churn_risk_schools: number;
  avg_daily_logins: number;
  avg_daily_logins_trend_percent: number;
  /** One point per month, oldest first; `value` is in PKR millions. */
  revenue_by_month: AnalyticsPoint[];
  package_distribution: PlatformPackageShare[];
  fee_collection_percent: number;
  attendance_marked_percent: number;
  results_published_percent: number;
}