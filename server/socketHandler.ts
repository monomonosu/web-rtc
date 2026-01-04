import { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../src/types/socket';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

// Track rooms and their participants
const rooms = new Map<string, Set<string>>();

export const handleSocketConnection = (io: TypedServer) => {
  io.on('connection', (socket: TypedSocket) => {
    console.log('User connected:', socket.id);

    // Handle user joining a room
    socket.on('join-room', (roomId: string) => {
      console.log(`User ${socket.id} joining room: ${roomId}`);

      // Add socket to room
      socket.join(roomId);

      // Track in rooms map
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)!.add(socket.id);

      // Get other users in room
      const otherUsers = Array.from(rooms.get(roomId)!).filter(
        (id) => id !== socket.id
      );

      console.log(
        `Room ${roomId} now has ${rooms.get(roomId)!.size} users:`,
        Array.from(rooms.get(roomId)!)
      );

      // Notify other users in room about the new user
      socket.to(roomId).emit('user-joined', socket.id);
    });

    // Handle WebRTC offer
    socket.on('offer', ({ offer, to }) => {
      console.log(`Relaying offer from ${socket.id} to ${to}`);
      io.to(to).emit('offer', { offer, from: socket.id });
    });

    // Handle WebRTC answer
    socket.on('answer', ({ answer, to }) => {
      console.log(`Relaying answer from ${socket.id} to ${to}`);
      io.to(to).emit('answer', { answer, from: socket.id });
    });

    // Handle ICE candidate
    socket.on('ice-candidate', ({ candidate, to }) => {
      console.log(`Relaying ICE candidate from ${socket.id} to ${to}`);
      io.to(to).emit('ice-candidate', { candidate, from: socket.id });
    });

    // Handle user leaving room
    socket.on('leave-room', () => {
      console.log(`User ${socket.id} leaving room`);
      handleUserLeave(socket, io);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      handleUserLeave(socket, io);
    });
  });
};

// Helper function to handle user leaving/disconnecting
function handleUserLeave(socket: TypedSocket, io: TypedServer) {
  // Find and remove user from all rooms
  rooms.forEach((users, roomId) => {
    if (users.has(socket.id)) {
      users.delete(socket.id);

      // Notify other users in the room
      socket.to(roomId).emit('user-left', socket.id);

      // Clean up empty rooms
      if (users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} is now empty and removed`);
      } else {
        console.log(
          `Room ${roomId} now has ${users.size} users:`,
          Array.from(users)
        );
      }
    }
  });
}
