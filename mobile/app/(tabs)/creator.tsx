

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useStreamStore } from '@/store/streamStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';

const STREAM_TITLE_MAX = 80;

export default function CreatorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { startStream, isLoading, error, isStreaming, activeStream } = useStreamStore();

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [toast, setToast] = useState<{ msg: string; variant: 'success' | 'error' } | null>(null);

  const handleStartStream = async () => {
    if (!title.trim()) {
      setTitleError('Give your stream a title');
      return;
    }
    if (!user) return;

    setTitleError('');
    const success = await startStream({
      creatorId: user.id,
      creatorName: user.username,
      title: title.trim(),
    });

    if (success) {
      router.push('/creator/live');
    } else {
      setToast({ msg: error ?? 'Failed to start stream', variant: 'error' });
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
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.header}>
          <Text style={styles.title}>Creator Studio</Text>
          <Text style={styles.subtitle}>Ready to go live, {user?.username}?</Text>
        </View>


        {isStreaming && activeStream ? (
          <View style={styles.activeBanner}>
            <View style={styles.activeLiveDot} />
            <View style={styles.activeBannerText}>
              <Text style={styles.activeBannerTitle}>You are live!</Text>
              <Text style={styles.activeBannerSub} numberOfLines={1}>
                {activeStream.title}
              </Text>
            </View>
            <Button
              label="Manage"
              onPress={() => router.push('/creator/live')}
              variant="glass"
              size="sm"
            />
          </View>
        ) : null}


        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="radio-button-on" size={22} color={Colors.live} />
            <Text style={styles.cardTitle}>Start a New Stream</Text>
          </View>

          <Input
            label="Stream Title"
            placeholder="What are you streaming today?"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (titleError) setTitleError('');
            }}
            error={titleError}
            maxLength={STREAM_TITLE_MAX}
            autoCapitalize="sentences"
            returnKeyType="go"
            onSubmitEditing={handleStartStream}
            accessibilityLabel="Stream title input"
          />
          <Text style={styles.charCount}>
            {title.length}/{STREAM_TITLE_MAX}
          </Text>

          <Button
            label={isLoading ? 'Starting...' : 'Go Live'}
            onPress={handleStartStream}
            isLoading={isLoading}
            disabled={isStreaming}
            fullWidth
            size="lg"
            leftIcon={
              <MaterialIcons name="radio-button-on" size={20} color="#fff" />
            }
          />
        </View>


        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Stream Tips</Text>
          {[
            { icon: 'mic' as const, text: 'Ensure mic permissions are granted' },
            { icon: 'videocam' as const, text: 'Good lighting makes a big difference' },
            { icon: 'wifi' as const, text: 'Use a stable internet connection' },
          ].map((tip, i) => (
            <View key={i} style={styles.tip}>
              <MaterialIcons name={tip.icon} size={18} color={Colors.primary} />
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {toast ? (
        <Toast
          message={toast.msg}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
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
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    includeFontPadding: false,
  },


  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  activeLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.live,
  },
  activeBannerText: {
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.live,
    includeFontPadding: false,
  },
  activeBannerSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },


  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  charCount: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: -Spacing.sm,
    includeFontPadding: false,
  },


  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    includeFontPadding: false,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
});