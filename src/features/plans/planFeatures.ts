const PLAN_RANK: Record<string, number> = {
  Free: 0,
  Starter: 1,
  Growth: 2,
  Professional: 3,
  Business: 4,
  Enterprise: 5,
};

export const FEATURE_MIN_TIER = {
  bulkImport: 'Starter',
  ledger: 'Growth',
  ownerStatement: 'Growth',
  roiTracking: 'Growth',
  tenantScreening: 'Professional',
  chatVideo: 'Professional',
  chatVoiceAndImages: 'Business',
  multipleManagers: 'Business',
} as const;

export const FEATURE_MIN_PLAN = FEATURE_MIN_TIER;

export function hasFeatureAccess(
  myTierName: string,
  feature: keyof typeof FEATURE_MIN_TIER
): boolean {
  const required = FEATURE_MIN_TIER[feature];
  return (PLAN_RANK[myTierName] ?? 0) >= (PLAN_RANK[required] ?? 0);
}
