import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AccessToken } from 'livekit-server-sdk';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

let _io: Server | null = null;
export function setStreamIo(io: Server) {
  _io = io;
}

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';

export async function startStream(req: Request, res: Response) {
  try {
    const { creatorId, creatorName, title } = req.body;

    if (!creatorId || !creatorName || !title) {
      return res.status(400).json({ success: false, error: 'creatorId, creatorName, and title are required' });
    }

    const roomName = `room_${creatorId}_${Date.now()}`;
    const livekitRoom = `lk_${roomName}`;


    const stream = await prisma.stream.create({
      data: {
        creatorId,
        creatorName,
        title,
        roomName,
        livekitRoom,
        status: 'live',
        viewerCount: 0,
        category: 'Live',
      },
    });


    let livekitToken = '';
    if (LIVEKIT_API_KEY && LIVEKIT_API_SECRET) {
      const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: creatorId,
        name: creatorName,
      });
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
      });
      livekitToken = await at.toJwt();
    } else {
      livekitToken = `mock_livekit_token_${Math.random().toString(36).slice(2)}`;
    }

    return res.json({
      success: true,
      data: {
        ...stream,
        livekitToken,
      },
    });
  } catch (error: any) {
    console.error('Start stream error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function listStreams(req: Request, res: Response) {
  try {
    const streams = await prisma.stream.findMany({
      where: { status: 'live' },
      orderBy: { startedAt: 'desc' },
    });
    return res.json({ success: true, data: streams });
  } catch (error: any) {
    console.error('List streams error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getStreamDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const stream = await prisma.stream.findUnique({
      where: { id },
    });

    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }


    const viewerId = `viewer_${Math.random().toString(36).slice(2, 9)}`;
    const viewerName = `Viewer_${Math.random().toString(36).slice(2, 5)}`;
    let livekitToken = '';

    if (LIVEKIT_API_KEY && LIVEKIT_API_SECRET) {
      const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: viewerId,
        name: viewerName,
      });
      at.addGrant({
        roomJoin: true,
        room: stream.roomName,
        canPublish: false,
        canSubscribe: true,
      });
      livekitToken = await at.toJwt();
    } else {
      livekitToken = `mock_livekit_token_viewer_${Math.random().toString(36).slice(2)}`;
    }

    return res.json({
      success: true,
      data: {
        ...stream,
        livekitToken,
      },
    });
  } catch (error: any) {
    console.error('Get stream detail error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function endStream(req: Request, res: Response) {
  try {
    const { streamId, creatorId } = req.body;

    if (!streamId || !creatorId) {
      return res.status(400).json({ success: false, error: 'streamId and creatorId are required' });
    }

    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return res.status(404).json({ success: false, error: 'Stream not found' });
    }

    if (stream.creatorId !== creatorId) {
      return res.status(403).json({ success: false, error: 'Forbidden: you are not the creator of this stream' });
    }

    await prisma.stream.update({
      where: { id: streamId },
      data: {
        status: 'ended',
        endedAt: new Date(),
        viewerCount: 0,
      },
    });

    if (_io) {
      _io.to(streamId).emit('stream-ended', { streamId });
    }

    return res.json({ success: true, data: { ended: true } });
  } catch (error: any) {
    console.error('End stream error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}