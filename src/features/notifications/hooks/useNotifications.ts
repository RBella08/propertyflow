import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService';
import { useAuthContext } from '@/providers/AuthProvider';

export function useNotifications() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();

  // Unique per component instance, so the bell and the notifications
  // page (both using this hook at the same time) each get their own
  // Realtime channel instead of colliding on an identical channel name.
  const instanceId = useRef(crypto.randomUUID()).current;

  const query = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: () => getNotifications(profile!.id),
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`notifications:${profile.id}:${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications', profile.id] });
          toast.info(payload.new.title as string, { description: payload.new.message as string });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, queryClient, instanceId]);

  const unreadCount = query.data?.filter((n) => !n.isRead).length ?? 0;

  return { ...query, unreadCount };
}

export function useDeleteNotification() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] }),
  });
}

export function useMarkAsRead() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] }),
  });
}

export function useMarkAllAsRead() {
  const { profile } = useAuthContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAsRead(profile!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', profile?.id] }),
  });
}
