/**
 * LiveHub — Shared TypeScript types
 * Mirrors the backend MongoDB schema exactly
 */

// ─── Auth ───────────────────────────────────────────────────────────────────

export type UserRole = 'creator' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Streams ─────────────────────────────────────────────────────────────────

export type StreamStatus = 'live' | 'ended' | 'scheduled';

export interface Stream {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  roomName: string;
  livekitRoom: string;
  status: StreamStatus;
  viewerCount: number;
  thumbnailUrl?: string;
  category?: string;
  startedAt: string;
  endedAt?: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  streamId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  // Phase 2 offline fields
  uuid?: string;
  deviceId?: string;
  synced?: boolean;
  pending?: boolean;
}

// ─── Offline Queue (Phase 2) ──────────────────────────────────────────────────

export interface QueuedMessage {
  uuid: string;
  deviceId: string;
  streamId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  synced: boolean;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Socket Events ────────────────────────────────────────────────────────────

// Client → Server
export interface JoinStreamPayload {
  streamId: string;
  userId: string;
}

export interface LeaveStreamPayload {
  streamId: string;
  userId: string;
}

export interface SendMessagePayload {
  streamId: string;
  senderId: string;
  senderName: string;
  message: string;
  uuid?: string;
  deviceId?: string;
}

export interface StartStreamPayload {
  creatorId: string;
  title: string;
}

export interface EndStreamPayload {
  streamId: string;
  creatorId: string;
}

// Server → Client
export interface ViewerCountPayload {
  streamId: string;
  count: number;
}

export interface StreamStartedPayload {
  stream: Stream;
}

export interface StreamEndedPayload {
  streamId: string;
}
