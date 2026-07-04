

import { io, Socket } from 'socket.io-client';
import { Config } from '@/constants/config';
import { ChatMessage, ViewerCountPayload } from '@/types';
import { useAuthStore } from '@/store/authStore';

type EventCallback<T> = (data: T) => void;

interface Listeners {
  'viewer-count': EventCallback<ViewerCountPayload>[];
  'receive-message': EventCallback<ChatMessage>[];
  'stream-started': EventCallback<{ streamId: string }>[];
  'stream-ended': EventCallback<{ streamId: string }>[];
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Listeners = {
    'viewer-count': [],
    'receive-message': [],
    'stream-started': [],
    'stream-ended': [],
  };
  private connected = false;
  private connectedToken: string | null | undefined = undefined;
  private currentStreamId: string | null = null;
  private currentUserId: string | null = null;
  private emitQueue: { event: string; payload: any }[] = [];

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }


  connect(): void {
    const currentToken = useAuthStore.getState().token;


    if (this.socket && this.connectedToken !== currentToken) {
      console.log('[SocketService] Token changed, reconnecting socket...');
      this.disconnect();
    }

    if (this.connected || this.socket) return;

    this.connectedToken = currentToken;
    if (!currentToken) {
      console.warn('[SocketService] Missing auth token, connecting as guest');
    }

    this.socket = io(Config.SOCKET_URL, {
      auth: { token: currentToken },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[SocketService] Connected to server successfully');


      while (this.emitQueue.length > 0) {
        const item = this.emitQueue.shift();
        if (item && this.socket) {
          console.log(`[SocketService] Flushing queued event "${item.event}"`);
          this.socket.emit(item.event, item.payload);
        }
      }


      if (this.currentStreamId && this.socket) {
        console.log(`[SocketService] Auto-rejoining stream room: ${this.currentStreamId}`);
        this.socket.emit('join-stream', {
          streamId: this.currentStreamId,
          userId: this.currentUserId,
        });
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('[SocketService] Disconnected from server');
    });


    this.socket.on('viewer-count', (data: ViewerCountPayload) => {
      this._emitToListeners('viewer-count', data);
    });

    this.socket.on('receive-message', (data: ChatMessage) => {
      this._emitToListeners('receive-message', data);
    });

    this.socket.on('stream-started', (data: { streamId: string }) => {
      this._emitToListeners('stream-started', data);
    });

    this.socket.on('stream-ended', (data: { streamId: string }) => {
      this._emitToListeners('stream-ended', data);
    });
  }


  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.connectedToken = undefined;
  }


  emit(event: string, payload: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, payload);
    } else {
      console.log(`[SocketService] Socket not connected. Queuing event "${event}"`);
      this.emitQueue.push({ event, payload });
    }
  }



  joinStream(streamId: string, userId?: string): void {
    this.currentStreamId = streamId;
    this.currentUserId = userId || null;
    this.emit('join-stream', { streamId, userId });
  }

  leaveStream(streamId: string, userId?: string): void {
    this.currentStreamId = null;
    this.currentUserId = null;

    this.emitQueue = this.emitQueue.filter((item) => item.event !== 'join-stream');
    this.emit('leave-stream', { streamId, userId });
  }

  sendChatMessage(payload: {
    streamId: string;
    senderId: string;
    senderName: string;
    message: string;
    uuid: string;
    deviceId?: string;
  }): void {
    this.emit('send-message', payload);
  }



  on(event: 'viewer-count', cb: EventCallback<ViewerCountPayload>): void;
  on(event: 'receive-message', cb: EventCallback<ChatMessage>): void;
  on(event: 'stream-started', cb: EventCallback<{ streamId: string }>): void;
  on(event: 'stream-ended', cb: EventCallback<{ streamId: string }>): void;
  on(event: string, cb: EventCallback<any>): void {
    const key = event as keyof Listeners;
    if (this.listeners[key]) {
      (this.listeners[key] as EventCallback<any>[]).push(cb);
    }
  }

  off(event: string, cb?: EventCallback<any>): void {
    const key = event as keyof Listeners;
    if (!this.listeners[key]) return;
    if (cb) {
      (this.listeners[key] as EventCallback<any>[]) = (
        this.listeners[key] as EventCallback<any>[]
      ).filter((l) => l !== cb);
    } else {
      (this.listeners[key] as EventCallback<any>[]) = [];
    }
  }

  private _emitToListeners<T>(event: keyof Listeners, data: T): void {
    (this.listeners[event] as EventCallback<T>[]).forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[SocketService] Listener error on ${event}:`, err);
      }
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const socketService = SocketService.getInstance();