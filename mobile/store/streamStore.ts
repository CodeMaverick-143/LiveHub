

import { create } from 'zustand';
import { Stream } from '@/types';
import { startStreamApi, endStreamApi } from '@/services/apiService';

interface ActiveStream extends Stream {
  livekitToken?: string;
}

interface StreamStore {
  activeStream: ActiveStream | null;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number; 

  
  startStream: (payload: {
    creatorId: string;
    creatorName: string;
    title: string;
  }) => Promise<boolean>;
  endStream: () => Promise<void>;
  incrementDuration: () => void;
  clearError: () => void;
}

export const useStreamStore = create<StreamStore>((set, get) => ({
  activeStream: null,
  isStreaming: false,
  isLoading: false,
  error: null,
  duration: 0,

  startStream: async (payload) => {
    set({ isLoading: true, error: null });
    const res = await startStreamApi(payload);

    if (res.success && res.data) {
      set({
        activeStream: res.data,
        isStreaming: true,
        isLoading: false,
        duration: 0,
      });
      return true;
    }

    set({ error: res.error ?? 'Failed to start stream', isLoading: false });
    return false;
  },

  endStream: async () => {
    const { activeStream } = get();
    if (!activeStream) return;

    set({ isLoading: true });
    await endStreamApi({
      streamId: activeStream.id,
      creatorId: activeStream.creatorId,
    });

    set({
      activeStream: null,
      isStreaming: false,
      isLoading: false,
      duration: 0,
    });
  },

  incrementDuration: () => {
    set((state) => ({ duration: state.duration + 1 }));
  },

  clearError: () => set({ error: null }),
}));
