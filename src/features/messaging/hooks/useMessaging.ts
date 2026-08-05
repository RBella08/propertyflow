import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMessagesForLease,
  sendMessage,
  markMessagesRead,
  getTenantConversation,
  getLandlordConversations,
  getManagerConversations,
} from '../services/messagingService';
import { getTenantId } from '@/features/payments/services/paymentService';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';

export function useLeaseMessages(leaseId: string | undefined) {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lease-messages', leaseId],
    queryFn: () => getMessagesForLease(leaseId as string),
    enabled: !!leaseId,
  });

  useEffect(() => {
    if (!leaseId) return;

    const channel = supabase
      .channel(`direct-messages:${leaseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `lease_id=eq.${leaseId}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ['lease-messages', leaseId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leaseId, queryClient]);

  useEffect(() => {
    if (leaseId && profile?.id) {
      markMessagesRead(leaseId, profile.id);
    }
  }, [leaseId, profile?.id]);

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
    }: {
      leaseId: string;
      recipientProfileId: string;
      body: string;
    }) => sendMessage(leaseId, profile!.id, recipientProfileId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lease-messages', variables.leaseId] });
    },
  });
}

export function useTenantConversation() {
  const { profile } = useAuthContext();
  return useQuery({
    queryKey: ['tenant-conversation', profile?.id],
    queryFn: async () => getTenantConversation(await getTenantId(profile!.id), profile!.id),
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
