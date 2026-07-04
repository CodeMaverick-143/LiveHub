

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useStream } from '@/hooks/useStreams';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/streams/ChatBubble';
import { Badge } from '@/components/ui/Badge';
import { SkeletonList } from '@/components/ui/SkeletonCard';
import { Toast } from '@/components/ui/Toast';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { formatViewerCount, formatDuration } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/services/socketService';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

let LiveKitRoom: any = null;
let VideoView: any = null;
let useTracks: any = () => [];
let webRTCAvailable = false;

try {
  const livekit = require('@livekit/react-native');
  LiveKitRoom = livekit.LiveKitRoom;
  VideoView = livekit.VideoView;
  useTracks = livekit.useTracks;
  webRTCAvailable = true;
} catch (_e) {

}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_HEIGHT * 0.38;
const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

function RemoteStreamView() {
  const tracks = useTracks([{ source: 'camera', updateOnly: false } as any]);
  const creatorTrack = (tracks[0] as any)?.publication?.videoTrack;

  if (!creatorTrack) {
    return (
      <View style={styles.videoPlaceholder}>
        <MaterialIcons name="videocam-off" size={32} color="rgba(255,255,255,0.4)" />
        <Text style={styles.placeholderText}>Connecting to stream...</Text>
      </View>
    );
  }

  return (
    <VideoView
      videoTrack={creatorTrack}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

export default function WatchStreamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: stream } = useStream(id);
  const { messages, viewerCount, isLoading: chatLoading, isSending, sendMessage } = useChat(id);
  const { isOnline } = useOfflineQueue();

  const [input, setInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [streamEnded, setStreamEnded] = useState(false);
  const flatListRef = useRef<FlatList>(null);


  useEffect(() => {
    if (!isOnline) {
      setToast('You are offline. Sending messages will queue them.');
    } else {
      setToast(null);
    }
  }, [isOnline]);


  useEffect(() => {
    if (!id) return;

    const handleStreamEnded = (payload: { streamId: string }) => {
      if (payload.streamId === id) {
        setStreamEnded(true);

        setTimeout(() => {
          router.back();
        }, 3000);
      }
    };

    socketService.on('stream-ended', handleStreamEnded);
    return () => {
      socketService.off('stream-ended', handleStreamEnded as (data: unknown) => void);
    };
  }, [id, router]);


  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const ok = await sendMessage(text);
    if (!ok && isOnline) setToast('Failed to send message');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >

      <View style={[styles.videoArea, { height: VIDEO_HEIGHT }]}>
        {webRTCAvailable && stream?.livekitToken ? (
          <LiveKitRoom
            serverUrl={LIVEKIT_URL}
            token={stream.livekitToken}
            connect={true}
            audio={true}
            video={true}
          >
            <RemoteStreamView />
          </LiveKitRoom>
        ) : (
          <>
            {stream?.thumbnailUrl ? (
              <Image
                source={{ uri: stream.thumbnailUrl }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <MaterialIcons name="videocam" size={40} color="rgba(255,255,255,0.3)" />
                <Text style={styles.placeholderText}>Stream preview unavailable</Text>
              </View>
            )}
          </>
        )}
        <View style={styles.videoOverlay} />


        <Pressable
          style={[styles.backBtn, { top: Spacing.sm }]}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </Pressable>

        <View style={styles.topBadges}>
          {isOnline ? (
            <Badge variant="live" label="LIVE" />
          ) : (
            <Badge variant="pending" label="Offline" icon="cloud-off" />
          )}
          {isOnline && viewerCount > 0 ? (
            <Badge
              variant="viewers"
              label={formatViewerCount(viewerCount)}
              icon="visibility"
            />
          ) : null}
        </View>


        <View style={styles.streamInfo}>
          {stream ? (
            <>
              <Text style={styles.streamTitle} numberOfLines={2}>
                {stream.title}
              </Text>
              <Text style={styles.streamCreator}>{stream.creatorName}</Text>
              <Text style={styles.streamDuration}>
                {formatDuration(stream.startedAt)}
              </Text>
            </>
          ) : null}
        </View>
      </View>


      <View style={styles.chatSection}>
        <View style={styles.chatHeader}>
          <MaterialIcons name="chat" size={16} color={Colors.textSecondary} />
          <Text style={styles.chatTitle}>Live Chat</Text>
          <Text style={styles.chatCount}>{messages.length} messages</Text>
        </View>

        {chatLoading ? (
          <SkeletonList count={3} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isOwn={item.senderId === user?.id}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}


        <View
          style={[
            styles.inputRow,
            { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
          ]}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Say something..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              maxLength={200}
              accessibilityLabel="Chat message input"
            />
          </View>
          <Pressable
            style={[styles.sendBtn, (!input.trim() || isSending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isSending}
            hitSlop={4}
            accessibilityLabel="Send message"
          >
            <MaterialIcons
              name="send"
              size={20}
              color={input.trim() && !isSending ? '#fff' : Colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {toast ? (
        <Toast message={toast} variant="error" onDismiss={() => setToast(null)} />
      ) : null}


      {streamEnded ? (
        <View style={styles.streamEndedOverlay}>
          <View style={styles.streamEndedCard}>
            <MaterialIcons name="videocam-off" size={48} color={Colors.textMuted} />
            <Text style={styles.streamEndedTitle}>Stream has ended</Text>
            <Text style={styles.streamEndedSub}>Returning to home...</Text>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },


  videoArea: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  backBtn: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 10,
    backgroundColor: 'rgba(11,12,14,0.75)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  topBadges: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    zIndex: 10,
  },
  streamInfo: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  streamTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: '#fff',
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  streamCreator: {
    fontSize: Typography.sm,
    color: 'rgba(248,250,252,0.9)',
    marginTop: 2,
    includeFontPadding: false,
  },
  streamDuration: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    includeFontPadding: false,
  },


  chatSection: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatTitle: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  chatCount: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  chatContent: {
    paddingVertical: Spacing.sm,
  },


  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 40,
    justifyContent: 'center',
  },
  chatInput: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    includeFontPadding: false,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
    shadowOpacity: 0,
    elevation: 0,
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090A0C',
    gap: Spacing.sm,
  },
  placeholderText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
  streamEndedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  streamEndedCard: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '75%',
  },
  streamEndedTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  streamEndedSub: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    includeFontPadding: false,
  },
});