import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLandlordPropertyOptionsForAccounting,
  getManagerPropertyOptionsForAccounting,
  addExpense,
  getLandlordLedger,
  getManagerLedger,
  getOwnerStatement,
  updatePropertyInvestment,
  getROIData,
  type ExpenseInput,
} from '../services/accountingService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLandlordPropertyOptionsForAccounting() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-accounting-properties', profile?.id],
    queryFn: () => getLandlordPropertyOptionsForAccounting(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useManagerPropertyOptionsForAccounting() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-accounting-properties', profile?.id],
    queryFn: () => getManagerPropertyOptionsForAccounting(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useAddExpense() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseInput) => addExpense(profile!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['manager-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['owner-statement'] });
      queryClient.invalidateQueries({ queryKey: ['roi-data'] });
    },
  });
}

export function useLandlordLedger(startDate: string, endDate: string) {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-ledger', profile?.id, startDate, endDate],
    queryFn: () => getLandlordLedger(profile!.id, startDate, endDate),
    enabled: !!profile?.id,
  });
}

export function useManagerLedger(startDate: string, endDate: string) {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-ledger', profile?.id, startDate, endDate],
    queryFn: () => getManagerLedger(profile!.id, startDate, endDate),
    enabled: !!profile?.id,
  });
}

export function useOwnerStatement(propertyId: string, startDate: string, endDate: string) {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['owner-statement', profile?.id, propertyId, startDate, endDate],
    queryFn: () => getOwnerStatement(profile!.id, propertyId, startDate, endDate),
    enabled: !!profile?.id && !!propertyId,
  });
}

export function useUpdatePropertyInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      purchasePrice,
      purchaseDate,
    }: {
      propertyId: string;
      purchasePrice: number;
      purchaseDate: string;
    }) => updatePropertyInvestment(propertyId, purchasePrice, purchaseDate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roi-data'] }),
  });
}

export function useROIData() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['roi-data', profile?.id],
    queryFn: () => getROIData(profile!.id),
    enabled: !!profile?.id,
  });
}
