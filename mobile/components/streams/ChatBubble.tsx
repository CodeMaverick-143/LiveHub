

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ChatMessage } from '@/types';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/format';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn?: boolean;
}

export const ChatBubble = React.memo(function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  if (message.senderId === 'system') {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBadge}>
          <Text style={styles.systemText}>{message.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, isOwn && styles.rowOwn]}>

      {!isOwn ? (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{message.senderName.charAt(0).toUpperCase()}</Text>
        </View>
      ) : null}

      <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
        {!isOwn ? (
          <Text style={styles.senderName}>{message.senderName}</Text>
        ) : null}
        <Text style={styles.messageText}>{message.message}</Text>

        <View style={styles.footer}>
          <Text style={styles.time}>{formatRelativeTime(message.createdAt)}</Text>
          {isOwn ? (
            <MaterialIcons
              name={
                message.pending
                  ? 'schedule'
                  : message.synced
                  ? 'done-all'
                  : 'error-outline'
              }
              size={12}
              color={
                message.pending
                  ? Colors.textMuted
                  : message.synced
                  ? Colors.success
                  : Colors.error
              }
            />
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  rowOwn: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.primaryLight,
    includeFontPadding: false,
  },
  bubble: {
    maxWidth: '75%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderBottomLeftRadius: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleOwn: {
    backgroundColor: 'rgba(94,106,210,0.08)',
    borderColor: 'rgba(94,106,210,0.3)',
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.primaryLight,
    includeFontPadding: false,
    marginBottom: 1,
  },
  messageText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    lineHeight: Typography.sm * Typography.normal,
    includeFontPadding: false,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 3,
  },
  time: {
    fontSize: 9,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  systemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    width: '100%',
  },
  systemBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  systemText: {
    fontSize: Typography.xs - 1,
    color: Colors.textMuted,
    textAlign: 'center',
    includeFontPadding: false,
  },
});