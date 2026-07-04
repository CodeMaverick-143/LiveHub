

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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useStreamStore } from '@/store/streamStore';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/streams/ChatBubble';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
import { formatViewerCount, formatDuration } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';
import { useAlert } from '@/template';

let LiveKitRoom: any = null;
let VideoView: any = null;
let useLocalParticipant: any = () => ({ localParticipant: null });
let webRTCAvailable = false;

try {
  const livekit = require('@livekit/react-native');
  LiveKitRoom = livekit.LiveKitRoom;
  VideoView = livekit.VideoView;
  useLocalParticipant = livekit.useLocalParticipant;
  webRTCAvailable = true;
} catch (_e) {
  
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PREVIEW_HEIGHT = SCREEN_HEIGHT * 0.35;
const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

function LocalPublisherView({ isCameraOff }: { isCameraOff: boolean }) {
  const { localParticipant } = useLocalParticipant();
  const cameraTrack = (localParticipant as any)?.getTrackPublication('camera')?.videoTrack;

  if (isCameraOff || !cameraTrack) {
    return (
      <View style={styles.cameraPlaceholder}>
        <MaterialIcons name="videocam-off" size={48} color={Colors.textMuted} />
      </View>
    );
  }

  return (
    <VideoView
      videoTrack={cameraTrack}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

export default function CreatorLiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user } = useAuthStore();
  const { activeStream, endStream, isLoading, incrementDuration } = useStreamStore();

  const streamId = activeStream?.id ?? '';
  const { messages, viewerCount, sendMessage, isSending } = useChat(streamId);

  const [input, setInput] = useState('');
  const [toast, setToast] = useState<{ msg: string; variant: 'success' | 'error' } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const durationRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  
  useEffect(() => {
    durationRef.current = setInterval(() => {
      incrementDuration();
    }, 1000);
    return () => {
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, []);

  
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages.length]);

  
  useEffect(() => {
    if (!activeStream && !isLoading) {
      router.replace('/(tabs)/creator');
    }
  }, [activeStream, isLoading]);

  const handleEndStream = () => {
    showAlert(
      'End Stream?',
      'Your stream will end and viewers will be disconnected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Stream',
          style: 'destructive',
          onPress: async () => {
            await endStream();
            setToast({ msg: 'Stream ended successfully', variant: 'success' });
            setTimeout(() => router.replace('/(tabs)/creator'), 1500);
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const ok = await sendMessage(text);
    if (!ok) setToast({ msg: 'Failed to send message', variant: 'error' });
  };

  if (!activeStream) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {}
      <View style={[styles.preview, { height: PREVIEW_HEIGHT }]}>
        {webRTCAvailable && activeStream.livekitToken ? (
          <LiveKitRoom
            serverUrl={LIVEKIT_URL}
            token={activeStream.livekitToken}
            connect={true}
            audio={!isMuted}
            video={!isCameraOff}
          >
            <LocalPublisherView isCameraOff={isCameraOff} />
          </LiveKitRoom>
        ) : (
          <View style={styles.cameraPlaceholder}>
            {isCameraOff ? (
              <MaterialIcons name="videocam-off" size={48} color={Colors.textMuted} />
            ) : (
              <>
                <MaterialIcons name="videocam" size={40} color="rgba(255,255,255,0.3)" />
                <Text style={styles.cameraHint}>Camera Preview</Text>
                <Text style={styles.cameraSubHint}>(Connect LiveKit for real video)</Text>
              </>
            )}
          </View>
        )}
        <View style={styles.previewOverlay} />

        {}
        <View style={styles.topLeft}>
          <Badge variant="live" label="LIVE" />
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{formatDuration(activeStream.startedAt)}</Text>
          </View>
        </View>

        {}
        <View style={styles.topRight}>
          <Badge
            variant="viewers"
            label={formatViewerCount(viewerCount || activeStream.viewerCount)}
            icon="visibility"
          />
        </View>

        {}
        <View style={styles.controls}>
          <Pressable
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted((v) => !v)}
            accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
          >
            <MaterialIcons
              name={isMuted ? 'mic-off' : 'mic'}
              size={20}
              color={isMuted ? Colors.error : '#fff'}
            />
          </Pressable>

          <Pressable
            style={[styles.controlBtn, isCameraOff && styles.controlBtnActive]}
            onPress={() => setIsCameraOff((v) => !v)}
            accessibilityLabel={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
          >
            <MaterialIcons
              name={isCameraOff ? 'videocam-off' : 'videocam'}
              size={20}
              color={isCameraOff ? Colors.error : '#fff'}
            />
          </Pressable>

          <Button
            label="End Stream"
            onPress={handleEndStream}
            variant="danger"
            size="sm"
            isLoading={isLoading}
            leftIcon={<MaterialIcons name="stop" size={16} color="#fff" />}
          />
        </View>
      </View>

      {}
      <View style={styles.titleRow}>
        <Text style={styles.streamTitle} numberOfLines={1}>
          {activeStream.title}
        </Text>
      </View>

      {}
      <View style={styles.chatSection}>
        <View style={styles.chatHeader}>
          <MaterialIcons name="chat" size={16} color={Colors.textSecondary} />
          <Text style={styles.chatHeaderText}>Live Chat</Text>
          <Text style={styles.chatCount}>{messages.length}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble message={item} isOwn={item.senderId === user?.id} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {}
        <View
          style={[
            styles.inputRow,
            { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
          ]}
        >
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.chatInput}
              placeholder="Reply to chat..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              maxLength={200}
              accessibilityLabel="Chat reply input"
            />
          </View>
          <Pressable
            style={[styles.sendBtn, (!input.trim() || isSending) && styles.sendBtnOff]}
            onPress={handleSend}
            disabled={!input.trim() || isSending}
            hitSlop={4}
            accessibilityLabel="Send reply"
          >
            <MaterialIcons
              name="send"
              size={18}
              color={input.trim() && !isSending ? '#fff' : Colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

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

  
  preview: {
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090A0C',
    gap: Spacing.sm,
  },
  cameraHint: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    includeFontPadding: false,
    fontWeight: Typography.medium,
  },
  cameraSubHint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    opacity: 0.6,
    includeFontPadding: false,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  topLeft: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    zIndex: 10,
  },
  topRight: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  durationPill: {
    backgroundColor: 'rgba(11,12,14,0.75)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  durationText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: Typography.bold,
    includeFontPadding: false,
  },
  controls: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    zIndex: 10,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(11,12,14,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderColor: Colors.error,
  },

  
  titleRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  streamTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },

  
  chatSection: {
    flex: 1,
    backgroundColor: Colors.surface,
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
  chatHeaderText: {
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
  inputWrap: {
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
  sendBtnOff: {
    backgroundColor: Colors.surfaceElevated,
    shadowOpacity: 0,
    elevation: 0,
  },
});
