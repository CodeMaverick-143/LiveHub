

import { useQuery } from '@tanstack/react-query';
import { fetchStreamsApi, fetchStreamByIdApi } from '@/services/apiService';
import { Stream } from '@/types';

export function useStreams() {
  return useQuery<Stream[]>({
    queryKey: ['streams'],
    queryFn: async () => {
      const res = await fetchStreamsApi();
      if (!res.success) throw new Error(res.error);
      return res.data ?? [];
    },
    refetchInterval: 15000,
    staleTime: 5000,
  });
}

export function useStream(id: string) {
  return useQuery<Stream>({
    queryKey: ['stream', id],
    queryFn: async () => {
      const res = await fetchStreamByIdApi(id);
      if (!res.success) throw new Error(res.error);
      return res.data!;
    },
    enabled: !!id,
    staleTime: 5000,
  });
}