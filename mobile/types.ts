


export type UserRole = 'creator' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface Stream {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  roomName: string;
  livekitRoom: string;
  status: string;
  viewerCount: number;
  startedAt: string;   
  endedAt?: string | null;
  category: string;
  livekitToken?: string;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  uuid: string;
  deviceId?: string | null;
  streamId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  pending?: boolean;
  synced?: boolean;
}

export interface QueuedMessage {
  id: string;
  streamId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  uuid: string;
  deviceId?: string | null;
  synced: boolean;
}

export interface ViewerCountPayload {
  streamId: string;
  count: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
