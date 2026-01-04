import { createServer } from 'http';
import { Server } from 'socket.io';
import { handleSocketConnection } from './socketHandler';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../src/types/socket';

const port = parseInt(process.env.PORT || '10000', 10);
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://*.vercel.app',
];

// Create HTTP server
const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebRTC Signaling Server is running');
});

// Initialize Socket.IO
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin matches any allowed pattern
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return allowedOrigin === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Set up socket event handlers
handleSocketConnection(io);

// Start server
httpServer.once('error', (err) => {
  console.error(err);
  process.exit(1);
});

httpServer.listen(port, () => {
  console.log(`> Socket.IO server ready on port ${port}`);
  console.log(`> Allowed origins: ${allowedOrigins.join(', ')}`);
});
