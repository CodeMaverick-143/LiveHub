

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { offlineQueue } from '@/services/offlineQueue';
import { QueuedMessage } from '@/types';

export interface OfflineQueueState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: { synced: number; failed: number } | null;
}

export function useOfflineQueue() {
  const [state, setState] = useState<OfflineQueueState>({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncResult: null,
  });


  useEffect(() => {
    offlineQueue.load().then(() => {
      setState((prev) => ({ ...prev, pendingCount: offlineQueue.pendingCount }));
    });
  }, []);


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (netState: NetInfoState) => {
      const isOnline = !!(netState.isConnected && netState.isInternetReachable);

      setState((prev) => ({ ...prev, isOnline }));


      if (isOnline && offlineQueue.pendingCount > 0) {
        setState((prev) => ({ ...prev, isSyncing: true }));
        const result = await offlineQueue.sync();
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncResult: result,
          pendingCount: offlineQueue.pendingCount,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const enqueueMessage = useCallback(async (message: QueuedMessage) => {
    await offlineQueue.enqueue(message);
    setState((prev) => ({ ...prev, pendingCount: offlineQueue.pendingCount }));
  }, []);

  const syncNow = useCallback(async () => {
    if (state.isSyncing || !state.isOnline) return;
    setState((prev) => ({ ...prev, isSyncing: true }));
    const result = await offlineQueue.sync();
    setState((prev) => ({
      ...prev,
      isSyncing: false,
      lastSyncResult: result,
      pendingCount: offlineQueue.pendingCount,
    }));
  }, [state.isOnline, state.isSyncing]);

  return {
    ...state,
    enqueueMessage,
    syncNow,
  };
}