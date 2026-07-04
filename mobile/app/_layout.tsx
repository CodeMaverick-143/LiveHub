

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import GestureProvider from '@/components/providers/GestureProvider';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
try {
  const { registerGlobals } = require('@livekit/react-native');
  registerGlobals();
} catch (_e) {


  console.warn('[LiveHub] WebRTC native module unavailable – streaming features require a dev build.');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5000,
    },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <GestureProvider>
          <QueryClientProvider client={queryClient}>
            <AppInitializer>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="stream/[id]"
                  options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                  name="creator/live"
                  options={{ animation: 'slide_from_bottom' }}
                />
              </Stack>
            </AppInitializer>
          </QueryClientProvider>
        </GestureProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});