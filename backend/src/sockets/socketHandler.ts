import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'livehub-super-secret-jwt-key-change-me';

interface SocketUser {
  id: string;
  username: string;
  role: string;
}

export function registerSocketHandlers(io: Server) {

  io.use((socket: Socket & { user?: SocketUser }, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (token) {
      try {
        const decoded = jwt.verify(token as string, JWT_SECRET) as SocketUser;
        socket.user = decoded;
      } catch (err) {
        console.warn('Socket authentication failed:', err);
      }
    }
    next();
  });

  io.on('connection', (socket: Socket & { user?: SocketUser }) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user?.username || 'Guest'})`);


    socket.on('join-stream', async (payload: { streamId: string; userId?: string }) => {
      const { streamId } = payload;
      if (!streamId) return;

      socket.join(streamId);
      console.log(`Socket ${socket.id} joined room: ${streamId}`);

      const username = socket.user?.username || 'Guest';


      io.to(streamId).emit('receive-message', {
        id: `sys_join_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        streamId,
        senderId: 'system',
        senderName: 'System',
        message: `${username} joined the stream`,
        createdAt: new Date().toISOString(),
      });

      try {

        const stream = await prisma.stream.update({
          where: { id: streamId },
          data: { viewerCount: { increment: 1 } },
        });


        io.to(streamId).emit('viewer-count', {
          streamId,
          count: stream.viewerCount,
        });
      } catch (err) {
        console.error('Error joining stream room:', err);
      }
    });


    socket.on('leave-stream', async (payload: { streamId: string; userId?: string }) => {
      const { streamId } = payload;
      if (!streamId) return;

      const username = socket.user?.username || 'Guest';


      io.to(streamId).emit('receive-message', {
        id: `sys_leave_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        streamId,
        senderId: 'system',
        senderName: 'System',
        message: `${username} left the stream`,
        createdAt: new Date().toISOString(),
      });

      socket.leave(streamId);
      console.log(`Socket ${socket.id} left room: ${streamId}`);

      try {

        const stream = await prisma.stream.findUnique({
          where: { id: streamId },
        });

        if (stream && stream.viewerCount > 0) {
          const updated = await prisma.stream.update({
            where: { id: streamId },
            data: { viewerCount: { decrement: 1 } },
          });

          io.to(streamId).emit('viewer-count', {
            streamId,
            count: updated.viewerCount,
          });
        }
      } catch (err) {
        console.error('Error leaving stream room:', err);
      }
    });


    socket.on(
      'send-message',
      async (payload: {
        streamId: string;
        senderId: string;
        senderName: string;
        message: string;
        uuid: string;
        deviceId?: string;
      }) => {
        const { streamId, senderId, senderName, message, uuid, deviceId } = payload;

        if (!streamId || !senderId || !senderName || !message || !uuid) {
          return;
        }

        try {

          let msg = await prisma.chatMessage.findUnique({
            where: { uuid },
          });

          if (!msg) {
            msg = await prisma.chatMessage.create({
              data: {
                uuid,
                deviceId: deviceId || null,
                streamId,
                senderId,
                senderName,
                message,
              },
            });
          }


          io.to(streamId).emit('receive-message', msg);
        } catch (err) {
          console.error('Error processing socket message:', err);
        }
      }
    );


    socket.on('disconnecting', async () => {
      const username = socket.user?.username || 'Guest';
      for (const room of socket.rooms) {
        if (room !== socket.id) {

          io.to(room).emit('receive-message', {
            id: `sys_leave_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            streamId: room,
            senderId: 'system',
            senderName: 'System',
            message: `${username} left the stream`,
            createdAt: new Date().toISOString(),
          });

          try {
            const stream = await prisma.stream.findUnique({
              where: { id: room },
            });

            if (stream && stream.viewerCount > 0) {
              const updated = await prisma.stream.update({
                where: { id: room },
                data: { viewerCount: { decrement: 1 } },
              });

              io.to(room).emit('viewer-count', {
                streamId: room,
                count: updated.viewerCount,
              });
            }
          } catch (err) {
            console.error('Error decrementing viewer count on disconnect:', err);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}