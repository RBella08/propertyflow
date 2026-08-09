const PLAN_RANK: Record<string, number> = {
  Free: 0,
  'Starter Monthly': 1,
  'Starter Yearly': 1,
  'Growth Monthly': 2,
  'Growth Yearly': 2,
  'Professional Monthly': 3,
  'Professional Yearly': 3,
  'Business Monthly': 4,
  'Business Yearly': 4,
  'Enterprise Monthly': 5,
  'Enterprise Yearly': 5,
};

export const FEATURE_MIN_PLAN = {
  bulkImport: 'Starter Monthly',
  ledger: 'Growth Monthly',
  ownerStatement: 'Growth Monthly',
  roiTracking: 'Growth Monthly',
  tenantScreening: 'Professional Monthly',
  multipleManagers: 'Business Monthly',
} as const;

export function hasFeatureAccess(
  myPlanName: string,
  feature: keyof typeof FEATURE_MIN_PLAN
): boolean {
  const required = FEATURE_MIN_PLAN[feature];
  return (PLAN_RANK[myPlanName] ?? 0) >= (PLAN_RANK[required] ?? 0);
}

export function getPropertyLimitLabel(myPlanName: string): string {
  if (PLAN_RANK[myPlanName] >= PLAN_RANK['Enterprise Monthly']) return 'Unlimited properties';
  return 'Limited by your plan — see Plans page';
}
