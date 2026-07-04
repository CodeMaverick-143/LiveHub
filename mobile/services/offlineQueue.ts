

import { storage } from '@/utils/storage';
import { Config } from '@/constants/config';
import { QueuedMessage } from '@/types';
import { sendMessageApi } from './apiService';

class OfflineQueueService {
  private static instance: OfflineQueueService;
  private queue: QueuedMessage[] = [];
  private isSyncing = false;

  private constructor() {}

  static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  
  async load(): Promise<void> {
    const saved = await storage.get<QueuedMessage[]>(Config.OFFLINE_QUEUE_KEY);
    this.queue = saved ?? [];
  }

  
  async enqueue(message: QueuedMessage): Promise<void> {
    this.queue.push(message);
    await this._persist();
  }

  
  getPending(): QueuedMessage[] {
    return this.queue.filter((m) => !m.synced);
  }

  
  async sync(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    this.isSyncing = true;

    const pending = this.getPending();
    let synced = 0;
    let failed = 0;

    for (const msg of pending) {
      try {
        const res = await sendMessageApi({
          streamId: msg.streamId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          message: msg.message,
          uuid: msg.uuid,
          deviceId: msg.deviceId || undefined,
        });

        if (res.success) {
          
          this.queue = this.queue.filter((m) => m.uuid !== msg.uuid);
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    await this._persist();
    this.isSyncing = false;

    return { synced, failed };
  }

  
  async clearSynced(): Promise<void> {
    this.queue = this.queue.filter((m) => !m.synced);
    await this._persist();
  }

  
  get length(): number {
    return this.queue.length;
  }

  get pendingCount(): number {
    return this.getPending().length;
  }

  private async _persist(): Promise<void> {
    await storage.set(Config.OFFLINE_QUEUE_KEY, this.queue);
  }
}

export const offlineQueue = OfflineQueueService.getInstance();
