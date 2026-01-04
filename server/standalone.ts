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

// Initialize Socket.IO with optimized settings
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  // CORS configuration
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

  // Performance optimizations
  transports: ['websocket', 'polling'], // Prefer WebSocket for better performance
  pingTimeout: 60000, // 60 seconds - how long to wait for pong before disconnect
  pingInterval: 25000, // 25 seconds - how often to send ping
  upgradeTimeout: 10000, // 10 seconds - time to upgrade from polling to websocket
  maxHttpBufferSize: 1e6, // 1MB - max message size (default is 1MB)

  // WebSocket compression disabled to save memory
  perMessageDeflate: false,

  // Connection timeout
  connectTimeout: 45000, // 45 seconds

  // Allow binary messages for efficient data transfer
  allowEIO3: true,
});

// Set up socket event handlers
handleSocketConnection(io);

// Connection monitoring
let connectionCount = 0;

io.on('connection', (socket) => {
  connectionCount++;
  console.log(
    `New connection: ${socket.id} | Total connections: ${connectionCount}`
  );

  socket.on('disconnect', () => {
    connectionCount--;
    console.log(
      `Disconnected: ${socket.id} | Total connections: ${connectionCount}`
    );
  });
});

// Log connection stats every 5 minutes
setInterval(() => {
  const socketCount = io.sockets.sockets.size;
  console.log(`📊 Stats | Active connections: ${socketCount}`);
}, 5 * 60 * 1000);

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');
  io.close(() => {
    console.log('Socket.IO server closed');
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
httpServer.once('error', (err) => {
  console.error(err);
  process.exit(1);
});

httpServer.listen(port, () => {
  console.log(`🚀 Socket.IO server ready on port ${port}`);
  console.log(`🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`⚡ Performance optimizations enabled`);
  console.log(`💾 Memory-efficient mode: perMessageDeflate disabled`);
});
