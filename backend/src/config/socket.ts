import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

// io lives here — no circular dependency

let io: Server;

export const initSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join:author', (author_id: string) => {
      socket.join(`author:${author_id}`);
      console.log(`Author ${author_id} joined their room`);
    });

    socket.on('join:admin', () => {
      socket.join('admin');
      console.log('Admin joined admin room');
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};