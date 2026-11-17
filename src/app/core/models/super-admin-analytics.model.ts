export type AnalyticsDashboardRange = '7D' | '30D' | '90D' | '12M';

export interface AnalyticsPeriod {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
}

export interface AnalyticsCountMetric {
  current: number;
  previous: number | null;
  percentageChange: number | null;
  comparisonAvailable: boolean;
  comparisonReason: string;
  definition: string;
}

export interface UnavailableAnalytics {
  available: false;
  reason: string;
}

export interface AnalyticsShare {
  count: number;
  percentage: number;
}

export interface FeeCollectionMetric {
  available: true;
  current: number;
  previous: number;
  percentageChange: number | null;
  collectionRate: {
    currentPercentage: number | null;
    previousPercentage: number | null;
    percentagePointChange: number | null;
    definition: string;
  };
  currency: string;
  definition: string;
}

export interface SuperAdminAnalyticsDashboard {
  range: AnalyticsDashboardRange;
  period: AnalyticsPeriod;
  summary: {
    revenue: UnavailableAnalytics & { currency: string };
    activeSchools: AnalyticsCountMetric;
    totalStudents: AnalyticsCountMetric;
    churnRate: UnavailableAnalytics;
    feeCollection: FeeCollectionMetric;
  };
  revenueTrend: UnavailableAnalytics & { data: unknown[] };
  revenueByPlan: UnavailableAnalytics & { data: unknown[] };
  newSchools: { period: string; label: string; count: number }[];
  subscriptionHealth: {
    active: AnalyticsShare;
    expiringSoon: AnalyticsShare;
    expired: AnalyticsShare;
    total: number;
    expiringWithinDays: number;
    definition: string;
  };
  demoFunnel: {
    demoRequests: AnalyticsShare;
    contacted: AnalyticsShare;
    demoDone: UnavailableAnalytics;
    converted: AnalyticsShare;
    definition: string;
  };
  schoolsByCity: { city: string; count: number; percentage: number }[];
  topSchools: UnavailableAnalytics & { data: unknown[] };
}