

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '@/constants/theme';

function SkeletonBox({ style }: { style?: object }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.9, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ backgroundColor: Colors.surfaceElevated, borderRadius: Radius.sm }, style, animStyle]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox style={styles.thumbnail} />
      <View style={styles.info}>
        <SkeletonBox style={styles.titleLine} />
        <SkeletonBox style={styles.subtitleLine} />
        <View style={styles.metaRow}>
          <SkeletonBox style={styles.badge} />
          <SkeletonBox style={styles.badge} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: {
    height: 180,
    borderRadius: 0,
  },
  info: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  titleLine: {
    height: 16,
    width: '80%',
    borderRadius: Radius.sm,
  },
  subtitleLine: {
    height: 13,
    width: '50%',
    borderRadius: Radius.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    height: 22,
    width: 60,
    borderRadius: Radius.full,
  },
});