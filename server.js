const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const { getDatabase } = require('./src/lib/storage/database.ts');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize database
  try {
    getDatabase();
    console.log('[Server] Database initialized');
  } catch (error) {
    console.error('[Server] Failed to initialize database:', error);
  }

  // Initialize WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  // Import WebSocket handlers dynamically
  let wsHandlers;
  import('./src/lib/websocket/server.ts')
    .then((module) => {
      // Handle both default and named exports
      wsHandlers = module.default || module;
      console.log('[Server] WebSocket handlers loaded');
    })
    .catch((error) => {
      console.error('[Server] Failed to load WebSocket handlers:', error);
    });

  server.on('upgrade', (request, socket, head) => {
    const { pathname, query } = parse(request.url, true);

    if (pathname === '/api/websocket') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        const roomId = query.room;
        const userName = query.userName;

        if (!roomId || !userName) {
          ws.close(1008, 'Missing room or userName parameter');
          return;
        }

        if (userName.length < 2 || userName.length > 30) {
          ws.close(1008, 'Invalid username: must be between 2 and 30 characters');
          return;
        }

        if (!wsHandlers) {
          ws.close(1011, 'Server not ready');
          return;
        }

        const sessionId = wsHandlers.handleConnection(ws, roomId, userName);

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            // Validate message structure
            if (typeof message === 'object' && message.type && message.payload) {
              wsHandlers.handleMessage(sessionId, message);
            } else {
              console.warn('[WebSocket] Invalid message format', { sessionId });
            }
          } catch (error) {
            console.error('[WebSocket] Failed to parse message', { error, sessionId });
          }
        });

        ws.on('close', () => {
          wsHandlers.handleDisconnection(sessionId);
        });

        ws.on('error', (error) => {
          console.error('[WebSocket] Error', { error, sessionId });
        });
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket available at ws://${hostname}:${port}/api/websocket`);
  });
});
