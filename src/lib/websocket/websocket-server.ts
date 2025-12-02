import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import {
  handleConnection,
  handleDisconnection,
  handleMessage,
} from './server';
import { isWebSocketMessage } from '@/types/websocket';
import { logger } from '../logger';

let wss: WebSocketServer | null = null;

export function initializeWebSocketServer(server: any): void {
  if (wss) {
    logger.warn('WebSocket server already initialized');
    return;
  }

  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: any, socket: any, head: any) => {
    const { pathname, query } = parse(request.url, true);

    if (pathname === '/api/websocket') {
      wss!.handleUpgrade(request, socket, head, (ws) => {
        const roomId = query.room as string;
        const userName = query.userName as string;

        if (!roomId || !userName) {
          ws.close(1008, 'Missing room or userName parameter');
          return;
        }

        if (userName.length < 2 || userName.length > 30) {
          ws.close(1008, 'Invalid username: must be between 2 and 30 characters');
          return;
        }

        const sessionId = handleConnection(ws, roomId, userName);

        ws.on('message', (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString());
            if (isWebSocketMessage(message)) {
              handleMessage(sessionId, message);
            } else {
              logger.warn('Invalid WebSocket message format', { sessionId });
            }
          } catch (error) {
            logger.error('Failed to parse WebSocket message', { error, sessionId });
          }
        });

        ws.on('close', () => {
          handleDisconnection(sessionId);
        });

        ws.on('error', (error) => {
          logger.error('WebSocket error', { error, sessionId });
        });
      });
    } else {
      socket.destroy();
    }
  });

  logger.info('WebSocket server initialized');
}

export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}
