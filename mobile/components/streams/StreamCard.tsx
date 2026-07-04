

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Stream } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { formatViewerCount, formatDuration } from '@/utils/format';

interface StreamCardProps {
  stream: Stream;
  onPress: () => void;
}

export function StreamCard({ stream, onPress }: StreamCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >

      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: stream.thumbnailUrl ?? 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80' }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
        />

        <View style={styles.overlay} />


        <View style={styles.liveBadge}>
          <Badge variant="live" label="LIVE" />
        </View>


        <View style={styles.durationBadge}>
          <Text style={styles.duration}>{formatDuration(stream.startedAt)}</Text>
        </View>


        <View style={styles.viewerRow}>
          <MaterialIcons name="visibility" size={14} color="#fff" />
          <Text style={styles.viewerText}>
            {formatViewerCount(stream.viewerCount)}
          </Text>
        </View>
      </View>


      <View style={styles.info}>
        <View style={styles.infoTop}>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {stream.creatorName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.title} numberOfLines={2}>
              {stream.title}
            </Text>
            <Text style={styles.creator}>{stream.creatorName}</Text>
          </View>
        </View>

        {stream.category ? (
          <Badge variant="category" label={stream.category} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },


  thumbnailContainer: {
    height: 180,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  liveBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  durationBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(11,12,14,0.75)',
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  duration: {
    fontSize: 10,
    color: '#fff',
    fontWeight: Typography.semibold,
    includeFontPadding: false,
    textTransform: 'uppercase',
  },
  viewerRow: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11,12,14,0.75)',
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  viewerText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: Typography.semibold,
    includeFontPadding: false,
  },


  info: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  infoTop: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.primaryLight,
    includeFontPadding: false,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    includeFontPadding: false,
    lineHeight: Typography.base * Typography.tight,
  },
  creator: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    includeFontPadding: false,
    marginTop: 2,
  },
});