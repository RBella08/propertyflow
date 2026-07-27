import { supabase } from '@/lib/supabase';
import type { ScreeningReviewFormInput } from '../schemas';

const RATING_SCORE: Record<string, number> = { excellent: 4, good: 3, fair: 2, poor: 1 };

export interface ScreeningReview {
  paymentReliability: string;
  propertyCare: string;
  wouldRentAgain: boolean;
  comments: string | null;
  createdAt: string;
}

export interface ScreeningSummary {
  reviewCount: number;
  averagePaymentScore: number;
  averagePropertyCareScore: number;
  percentWouldRentAgain: number;
  reviews: ScreeningReview[];
}

export async function submitScreeningReview(
  reviewerProfileId: string,
  tenantProfileId: string,
  leaseId: string,
  input: ScreeningReviewFormInput
): Promise<void> {
  const { error } = await supabase.from('tenant_screening_reviews').insert({
    tenant_profile_id: tenantProfileId,
    reviewer_profile_id: reviewerProfileId,
    lease_id: leaseId,
    payment_reliability: input.paymentReliability,
    property_care: input.propertyCare,
    would_rent_again: input.wouldRentAgain === 'yes',
    comments: input.comments || null,
  });
  if (error) throw error;
}

export async function getScreeningSummary(tenantProfileId: string): Promise<ScreeningSummary> {
  const { data, error } = await supabase
    .from('tenant_screening_reviews')
    .select('payment_reliability, property_care, would_rent_again, comments, created_at')
    .eq('tenant_profile_id', tenantProfileId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const reviewCount = rows.length;

  const averagePaymentScore = reviewCount
    ? rows.reduce((sum, r) => sum + RATING_SCORE[r.payment_reliability], 0) / reviewCount
    : 0;
  const averagePropertyCareScore = reviewCount
    ? rows.reduce((sum, r) => sum + RATING_SCORE[r.property_care], 0) / reviewCount
    : 0;
  const percentWouldRentAgain = reviewCount
    ? Math.round((rows.filter((r) => r.would_rent_again).length / reviewCount) * 100)
    : 0;

  return {
    reviewCount,
    averagePaymentScore: Number(averagePaymentScore.toFixed(1)),
    averagePropertyCareScore: Number(averagePropertyCareScore.toFixed(1)),
    percentWouldRentAgain,
    reviews: rows.map((r) => ({
      paymentReliability: r.payment_reliability,
      propertyCare: r.property_care,
      wouldRentAgain: r.would_rent_again,
      comments: r.comments,
      createdAt: r.created_at,
    })),
  };
}

export async function hasReviewedLease(
  reviewerProfileId: string,
  leaseId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('tenant_screening_reviews')
    .select('id')
    .eq('reviewer_profile_id', reviewerProfileId)
    .eq('lease_id', leaseId)
    .maybeSingle();
  return !!data;
}
