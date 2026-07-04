import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

let _io: Server | null = null;
export function setChatIo(io: Server) {
  _io = io;
}

export async function fetchChatHistory(req: Request, res: Response) {
  try {
    const { streamId } = req.params;

    if (!streamId) {
      return res.status(400).json({ success: false, error: 'streamId is required' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { streamId },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ success: true, data: messages });
  } catch (error: any) {
    console.error('Fetch chat history error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function sendChatMessage(req: Request, res: Response) {
  try {
    const { streamId, senderId, senderName, message, uuid, deviceId } = req.body;

    if (!streamId || !senderId || !senderName || !message || !uuid) {
      return res.status(400).json({ success: false, error: 'streamId, senderId, senderName, message, and uuid are required' });
    }


    const existing = await prisma.chatMessage.findUnique({
      where: { uuid },
    });

    if (existing) {

      return res.json({ success: true, data: existing, deduplicated: true });
    }

    const msg = await prisma.chatMessage.create({
      data: {
        uuid,
        deviceId: deviceId || null,
        streamId,
        senderId,
        senderName,
        message,
      },
    });


    if (_io) {
      _io.to(streamId).emit('receive-message', msg);
    }

    return res.json({ success: true, data: msg });
  } catch (error: any) {

    if (error.code === 'P2002') {
      const existing = await prisma.chatMessage.findUnique({
        where: { uuid: req.body.uuid },
      });
      return res.json({ success: true, data: existing, deduplicated: true });
    }
    console.error('Send chat message error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}