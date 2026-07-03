

import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const isCreator = user?.role === 'creator';

  const tabBarStyle = {
    height: Platform.select({
      ios: insets.bottom + 52,
      android: insets.bottom + 54,
      default: 64,
    }),
    paddingTop: 6,
    paddingBottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 4,
      default: 8,
    }),
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" size={size} color={color} />
          ),
        }}
      />
      {isCreator ? (
        <Tabs.Screen
          name="creator"
          options={{
            title: 'Go Live',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="videocam" size={size} color={color} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="creator"
          options={{
            href: null,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
