import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMessagesForConversation,
  sendMessage,
  markMessagesRead,
  getTenantConversations,
  getLandlordConversations,
  getManagerConversations,
} from '../services/messagingService';
import { getTenantId } from '@/features/payments/services/paymentService';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLeaseMessages(
  leaseId: string | undefined,
  counterpartProfileId: string | undefined
) {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lease-messages', leaseId, counterpartProfileId],
    queryFn: () =>
      getMessagesForConversation(leaseId as string, profile!.id, counterpartProfileId as string),
    enabled: !!leaseId && !!counterpartProfileId && !!profile?.id,
  });

  useEffect(() => {
    if (!leaseId || !counterpartProfileId) return;

    const channel = supabase
      .channel(`direct-messages:${leaseId}:${counterpartProfileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `lease_id=eq.${leaseId}`,
        },
        () =>
          queryClient.invalidateQueries({
            queryKey: ['lease-messages', leaseId, counterpartProfileId],
          })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leaseId, counterpartProfileId, queryClient]);

  useEffect(() => {
    if (leaseId && profile?.id && counterpartProfileId) {
      markMessagesRead(leaseId, profile.id, counterpartProfileId);
    }
  }, [leaseId, profile?.id, counterpartProfileId]);

  return query;
}

export function useSendMessage() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leaseId,
      recipientProfileId,
      body,
      imageFile,
    }: {
      leaseId: string;
      recipientProfileId: string;
      body: string;
      imageFile?: File | null;
    }) => sendMessage(leaseId, profile!.id, recipientProfileId, body, imageFile ?? undefined),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lease-messages', variables.leaseId, variables.recipientProfileId],
      });
    },
  });
}

export function useTenantConversations() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['tenant-conversations', profile?.id],
    queryFn: async () => getTenantConversations(await getTenantId(profile!.id), profile!.id),
    enabled: !!profile?.id,
  });
}

export function useLandlordConversations() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['landlord-conversations', profile?.id],
    queryFn: () => getLandlordConversations(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useManagerConversations() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['manager-conversations', profile?.id],
    queryFn: () => getManagerConversations(profile!.id),
    enabled: !!profile?.id,
  });
}
