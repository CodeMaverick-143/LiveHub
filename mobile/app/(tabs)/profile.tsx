

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { useAlert } from '@/template';
import { formatRelativeTime } from '@/utils/format';

interface StatItem {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { showAlert } = useAlert();
  const [toast, setToast] = useState<string | null>(null);

  const isCreator = user?.role === 'creator';

  const stats: StatItem[] = isCreator
    ? [
        { label: 'Streams', value: '12', icon: 'live-tv' },
        { label: 'Peak Viewers', value: '2.4K', icon: 'visibility' },
        { label: 'Hours Live', value: '47h', icon: 'schedule' },
      ]
    : [
        { label: 'Watched', value: '38', icon: 'play-circle-filled' },
        { label: 'Chats Sent', value: '214', icon: 'chat-bubble' },
        { label: 'Creators', value: '8', icon: 'people' },
      ];

  const handleLogout = () => {
    showAlert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {}
        <Text style={styles.pageTitle}>Profile</Text>

        {}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <View style={styles.rolePill}>
            <MaterialIcons
              name={isCreator ? 'radio-button-on' : 'visibility'}
              size={14}
              color={isCreator ? Colors.live : Colors.primary}
            />
            <Text style={[styles.roleText, { color: isCreator ? Colors.live : Colors.primary }]}>
              {isCreator ? 'Creator' : 'Viewer'}
            </Text>
          </View>
          {user?.createdAt ? (
            <Text style={styles.joinDate}>
              Joined {formatRelativeTime(user.createdAt)}
            </Text>
          ) : null}
        </View>

        {}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <MaterialIcons name={stat.icon} size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {[
            { label: 'Edit Profile', icon: 'edit' as const },
            { label: 'Notifications', icon: 'notifications' as const },
            { label: 'Privacy', icon: 'lock' as const },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => setToast(`${item.label} — coming soon`)}
              accessibilityLabel={item.label}
            >
              <MaterialIcons name={item.icon} size={20} color={Colors.textSecondary} />
              <Text style={styles.rowLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {[
            { label: 'Help Center', icon: 'help' as const },
            { label: 'About LiveHub', icon: 'info' as const },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => setToast(`${item.label} — coming soon`)}
              accessibilityLabel={item.label}
            >
              <MaterialIcons name={item.icon} size={20} color={Colors.textSecondary} />
              <Text style={styles.rowLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.logoutContainer}>
          <Button
            label="Log Out"
            onPress={handleLogout}
            variant="danger"
            fullWidth
            size="md"
            leftIcon={<MaterialIcons name="logout" size={18} color="#fff" />}
          />
        </View>

        <Text style={styles.version}>LiveHub v1.0.0 — MVP</Text>
      </ScrollView>

      {toast ? (
        <Toast message={toast} variant="info" onDismiss={() => setToast(null)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  pageTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
    marginBottom: Spacing.sm,
  },

  
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.primaryLight,
    includeFontPadding: false,
  },
  username: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    includeFontPadding: false,
  },
  joinDate: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    includeFontPadding: false,
  },

  
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: Typography.base,
    fontWeight: Typography.extrabold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    includeFontPadding: false,
    textTransform: 'uppercase',
  },

  
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.semibold,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    includeFontPadding: false,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowPressed: {
    backgroundColor: Colors.surfaceElevated,
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },

  logoutContainer: {
    marginTop: Spacing.sm,
  },
  version: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
