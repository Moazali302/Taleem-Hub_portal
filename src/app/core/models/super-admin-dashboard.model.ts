export interface SuperAdminDashboardSummary {
  totalSchools: {
    total: number;
    previousPeriodTotal: number | null;
    percentageChange: number | null;
  };
  activeStudents: {
    total: number;
    previousPeriodTotal?: number | null;
    percentageChange?: number | null;
    comparisonAvailable?: boolean;
    comparisonReason?: string;
  };
  totalTeachers: {
    total: number;
    previousPeriodTotal?: number | null;
    percentageChange?: number | null;
    comparisonAvailable?: boolean;
    comparisonReason?: string;
  };
  expiringSubscriptions: {
    total: number;
    urgent: number;
    expiringWithinDays: number;
    urgentWithinDays: number;
  };
  openComplaints: {
    total: number;
    critical: number;
  };
}

export interface RevenueTrendPoint {
  period: string;
  amount: number;
}

export interface SuperAdminDashboardRevenue {
  available: boolean;
  currentMonthRevenue: number | null;
  currency: string;
  trend: RevenueTrendPoint[];
  reason: string | null;
}

export interface SuperAdminDashboardFeeCollection {
  available: boolean;
  rate: number | null;
  collected: number;
  expected: number;
  currency: string;
  period: {
    from: string;
    toExclusive: string;
  };
  definition: string;
}

export interface SuperAdminDashboardActivity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface SuperAdminDashboardExpiringSubscription {
  schoolId: number;
  schoolName: string;
  plan: string;
  planName: string;
  expiresAt: string;
  daysRemaining: number;
  isUrgent: boolean;
}

export interface SuperAdminDashboard {
  summary: SuperAdminDashboardSummary;
  revenueAnalytics: SuperAdminDashboardRevenue;
  feeCollection: SuperAdminDashboardFeeCollection;
  recentActivity: SuperAdminDashboardActivity[];
  expiringSubscriptions: SuperAdminDashboardExpiringSubscription[];
  definitions: Record<string, string>;
}
