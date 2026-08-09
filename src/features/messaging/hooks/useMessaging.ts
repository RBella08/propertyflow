import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMessagesForConversation,
  sendMessage,
  markMessagesRead,
  getTenantConversations,
  getLandlordConversations,
  getManagerConversations,
  deleteMessage,
  editMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
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
          event: '*',
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

export function useDeleteMessageForMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, iAmSender }: { messageId: string; iAmSender: boolean }) =>
      deleteMessageForMe(messageId, iAmSender),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lease-messages'] }),
  });
}

export function useDeleteMessageForEveryone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => deleteMessageForEveryone(messageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lease-messages'] }),
  });
}

export function useEditMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, newBody }: { messageId: string; newBody: string }) =>
      editMessage(messageId, newBody),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lease-messages'] }),
  });
}

export function useSendMessage() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leaseId,
      recipientProfileId,
      body,
      imageFiles,
      audioBlob,
      videoFile,
    }: {
      leaseId: string;
      recipientProfileId: string;
      body: string;
      imageFiles?: File[];
      audioBlob?: Blob;
      videoFile?: File;
    }) =>
      sendMessage(leaseId, profile!.id, recipientProfileId, body, imageFiles, audioBlob, videoFile),
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

export function useTypingIndicator(leaseId: string | undefined, myProfileId: string | undefined) {
  const [otherIsTyping, setOtherIsTyping] = useState(false);

  useEffect(() => {
    if (!leaseId) return;

    const channel = supabase.channel(`typing:${leaseId}`);
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.profileId !== myProfileId) {
          setOtherIsTyping(true);
          setTimeout(() => setOtherIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leaseId, myProfileId]);

  const broadcastTyping = () => {
    if (!leaseId) return;
    supabase.channel(`typing:${leaseId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { profileId: myProfileId },
    });
  };

  return { otherIsTyping, broadcastTyping };
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-messages'] });
    },
  });
}
