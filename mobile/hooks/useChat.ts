

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchChatApi, sendMessageApi } from '@/services/apiService';
import { socketService } from '@/services/socketService';
import { ChatMessage } from '@/types';
import { Config } from '@/constants/config';
import { useAuthStore } from '@/store/authStore';
import { generateUUID } from '@/utils/uuid';
import { storage } from '@/utils/storage';

export function useChat(streamId: string) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const deviceIdRef = useRef<string>('');

  
  useEffect(() => {
    (async () => {
      let id = await storage.get<string>(Config.DEVICE_ID_KEY);
      if (!id) {
        id = generateUUID();
        await storage.set(Config.DEVICE_ID_KEY, id);
      }
      deviceIdRef.current = id;
    })();
  }, []);

  
  const { isLoading } = useQuery({
    queryKey: ['chat', streamId],
    queryFn: async () => {
      const res = await fetchChatApi(streamId);
      if (res.success && res.data) {
        setMessages(res.data);
        return res.data;
      }
      return [];
    },
    enabled: !!streamId,
  });

  
  useEffect(() => {
    if (!streamId || !user) return;

    socketService.connect();
    socketService.joinStream(streamId, user.id);

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id || (msg.uuid && m.uuid === msg.uuid))) {
          return prev.map((m) =>
            m.uuid === msg.uuid || m.id === msg.id
              ? { ...m, ...msg, synced: true, pending: false }
              : m
          );
        }
        const next = [...prev, msg];
        return next.slice(-Config.CHAT_MAX);
      });
    };

    const handleViewerCount = (payload: { streamId: string; count: number }) => {
      if (payload.streamId === streamId) {
        setViewerCount(payload.count);
      }
    };

    socketService.on('receive-message', handleMessage);
    socketService.on('viewer-count', handleViewerCount);

    return () => {
      socketService.leaveStream(streamId, user.id);
      socketService.off('receive-message', handleMessage as (data: unknown) => void);
      socketService.off('viewer-count', handleViewerCount as (data: unknown) => void);
    };
  }, [streamId, user]);

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!user || !text.trim()) return false;

      const uuid = generateUUID();

      
      const optimistic: ChatMessage = {
        id: uuid,
        streamId,
        senderId: user.id,
        senderName: user.username,
        message: text.trim(),
        createdAt: new Date().toISOString(),
        uuid,
        deviceId: deviceIdRef.current,
        synced: false,
        pending: true,
      };

      setMessages((prev) => [...prev, optimistic]);
      setIsSending(true);

      try {
        const res = await sendMessageApi({
          streamId,
          senderId: user.id,
          senderName: user.username,
          message: text.trim(),
          uuid,
          deviceId: deviceIdRef.current,
        });

        
        setMessages((prev) =>
          prev.map((m) =>
            m.id === uuid
              ? { ...m, synced: true, pending: false, id: res.data?.id ?? uuid }
              : m
          )
        );

        return res.success;
      } catch {
        
        setMessages((prev) =>
          prev.map((m) => (m.id === uuid ? { ...m, pending: false, synced: false } : m))
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [user, streamId]
  );

  return {
    messages,
    viewerCount,
    isLoading,
    isSending,
    sendMessage,
  };
}
