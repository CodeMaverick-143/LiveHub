

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

type BadgeVariant = 'live' | 'viewers' | 'category' | 'pending';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function Badge({ variant, label, icon }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      {variant === 'live' ? (
        <View style={styles.liveDot} />
      ) : icon ? (
        <MaterialIcons
          name={icon}
          size={12}
          color={variant === 'viewers' ? Colors.textPrimary : Colors.textSecondary}
        />
      ) : null}
      {label ? <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  live: {
    backgroundColor: Colors.live,
  },
  viewers: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  category: {
    backgroundColor: 'rgba(94,106,210,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(94,106,210,0.18)',
  },
  pending: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.18)',
  },

  text: {
    fontSize: 10,
    fontWeight: Typography.bold,
    includeFontPadding: false,
    textTransform: 'uppercase',
  },
  text_live: { color: '#fff' },
  text_viewers: { color: Colors.textPrimary },
  text_category: { color: Colors.primaryLight },
  text_pending: { color: Colors.warning },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
});