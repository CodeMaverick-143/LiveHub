

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchChatApi, sendMessageApi } from '@/services/apiService';
import { socketService } from '@/services/socketService';
import { ChatMessage } from '@/types';
import { Config } from '@/constants/config';
import { useAuthStore } from '@/store/authStore';
import { generateUUID } from '@/utils/uuid';
import { storage } from '@/utils/storage';
import { useOfflineQueue } from './useOfflineQueue';
import { offlineQueue } from '@/services/offlineQueue';

export function useChat(streamId: string) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const deviceIdRef = useRef<string>('');
  const { isOnline, enqueueMessage } = useOfflineQueue();
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


  const chatQuery = useQuery({
    queryKey: ['chat', streamId],
    queryFn: async () => {
      const res = await fetchChatApi(streamId);
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    enabled: !!streamId,
  });

  useEffect(() => {
    const dbMessages = chatQuery.data ?? [];
    const pending = offlineQueue.getPending()
      .filter((m) => m.streamId === streamId)
      .map((m) => ({
        id: m.uuid,
        streamId: m.streamId,
        senderId: m.senderId,
        senderName: m.senderName,
        message: m.message,
        createdAt: m.createdAt,
        uuid: m.uuid,
        deviceId: m.deviceId,
        synced: false,
        pending: true,
      }));
    setMessages([...dbMessages, ...pending].slice(-Config.CHAT_MAX));
  }, [chatQuery.data, streamId]);

  useEffect(() => {
    if (isOnline) {
      chatQuery.refetch();
    }
  }, [isOnline, chatQuery]);

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

      if (!isOnline) {
        const queued = {
          id: uuid,
          streamId,
          senderId: user.id,
          senderName: user.username,
          message: text.trim(),
          createdAt: optimistic.createdAt,
          uuid,
          deviceId: deviceIdRef.current,
          synced: false,
        };
        await enqueueMessage(queued);
        setIsSending(false);
        return true;
      }

      try {
        const res = await sendMessageApi({
          streamId,
          senderId: user.id,
          senderName: user.username,
          message: text.trim(),
          uuid,
          deviceId: deviceIdRef.current,
        });

        if (res.success) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === uuid
                ? { ...m, synced: true, pending: false, id: res.data?.id ?? uuid }
                : m
            )
          );
          return true;
        } else {

          const queued = {
            id: uuid,
            streamId,
            senderId: user.id,
            senderName: user.username,
            message: text.trim(),
            createdAt: optimistic.createdAt,
            uuid,
            deviceId: deviceIdRef.current,
            synced: false,
          };
          await enqueueMessage(queued);
          return false;
        }
      } catch {

        const queued = {
          id: uuid,
          streamId,
          senderId: user.id,
          senderName: user.username,
          message: text.trim(),
          createdAt: optimistic.createdAt,
          uuid,
          deviceId: deviceIdRef.current,
          synced: false,
        };
        await enqueueMessage(queued);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [user, streamId, isOnline, enqueueMessage]
  );

  return {
    messages,
    viewerCount,
    isLoading: chatQuery.isLoading,
    isSending,
    sendMessage,
  };
}