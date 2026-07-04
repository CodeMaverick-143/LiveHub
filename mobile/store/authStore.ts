

import { create } from 'zustand';
import { User } from '@/types';
import { storage } from '@/utils/storage';
import { Config } from '@/constants/config';
import { loginApi, LoginPayload } from '@/services/apiService';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;


  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null });
    const res = await loginApi(payload);

    if (res.success && res.data) {
      const { user, token } = res.data;
      await storage.set(Config.TOKEN_KEY, token);
      await storage.set(Config.USER_KEY, user);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    }

    set({ error: res.error ?? 'Login failed', isLoading: false });
    return false;
  },

  logout: async () => {
    await storage.remove(Config.TOKEN_KEY);
    await storage.remove(Config.USER_KEY);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    const token = await storage.get<string>(Config.TOKEN_KEY);
    const user = await storage.get<User>(Config.USER_KEY);

    if (token && user) {
      set({ user, token, isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));