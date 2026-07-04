

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { UserRole } from '@/types';

type RoleOption = { label: string; value: UserRole; desc: string; icon: keyof typeof MaterialIcons.glyphMap };

const ROLES: RoleOption[] = [
  { label: 'Viewer', value: 'viewer', desc: 'Browse and watch streams', icon: 'remove-red-eye' },
  { label: 'Creator', value: 'creator', desc: 'Go live and broadcast', icon: 'videocam' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [toast, setToast] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = (): boolean => {
    let valid = true;
    if (!username.trim()) {
      setUsernameError('Username is required');
      valid = false;
    } else {
      setUsernameError('');
    }
    if (!password || password.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    const success = await login({ username, password, role });
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.header}>
          <View style={styles.logoIconContainer}>
            <MaterialIcons name="explore" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>LiveHub</Text>
          <Text style={styles.tagline}>Go live. Connect. Broadcast.</Text>
        </View>


        <View style={styles.card}>

          <View style={styles.demoBadge}>
            <View style={styles.demoDot} />
            <Text style={styles.demoText}>Demo Mode — any credentials work</Text>
          </View>

          <Text style={styles.formTitle}>Sign In</Text>


          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <Pressable
                key={r.value}
                style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                onPress={() => setRole(r.value)}
                accessibilityLabel={`Select role: ${r.label}`}
              >
                <MaterialIcons
                  name={r.icon}
                  size={20}
                  color={role === r.value ? Colors.primaryLight : Colors.textMuted}
                />
                <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                  {r.label}
                </Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            error={usernameError}
            autoCapitalize="words"
            returnKeyType="next"
            accessibilityLabel="Username input"
          />

          <Input
            label="Password"
            placeholder="Min. 4 characters"
            value={password}
            onChangeText={setPassword}
            error={passwordError || error || undefined}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            accessibilityLabel="Password input"
          />

          <Button
            label={isLoading ? 'Signing in...' : 'Sign In'}
            onPress={handleLogin}
            isLoading={isLoading}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {toast ? (
        <Toast
          message={toast}
          variant="error"
          onDismiss={() => {
            setToast(null);
            clearError();
          }}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },


  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  logoText: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  tagline: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },


  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(245,158,11,0.06)',
    paddingHorizontal: Spacing.md - 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.12)',
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  demoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.warning,
  },
  demoText: {
    fontSize: Typography.xs,
    color: Colors.warning,
    fontWeight: Typography.semibold,
    includeFontPadding: false,
  },

  formTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
    marginBottom: Spacing.xs,
  },


  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(94,106,210,0.06)',
  },
  roleLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  roleLabelActive: {
    color: Colors.primaryLight,
  },
  roleDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 13,
  },

  submitButton: {
    marginTop: Spacing.sm,
  },
});