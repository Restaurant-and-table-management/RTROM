import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Custom hook for connecting to the RTROM Kitchen WebSocket.
 *
 * @param {Function} onTicketUpdate - Callback invoked when a kitchen ticket update arrives on /topic/kitchen/tickets
 * @param {boolean} enabled - Set to false to skip connection (e.g., when not on kitchen page)
 *
 * Usage:
 *   useKitchenSocket((ticket) => { console.log('Updated:', ticket); }, true);
 */
const useKitchenSocket = (onTicketUpdate, enabled = true) => {
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[RTROM Kitchen WS] Connected');

        client.subscribe('/topic/kitchen/tickets', (message) => {
          try {
            const ticket = JSON.parse(message.body);
            if (onTicketUpdate) onTicketUpdate(ticket);
          } catch (err) {
            console.error('[RTROM Kitchen WS] Failed to parse message:', err);
          }
        });
      },
      onDisconnect: () => {
        console.log('[RTROM Kitchen WS] Disconnected');
      },
      onStompError: (frame) => {
        console.error('[RTROM Kitchen WS] STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [onTicketUpdate]);

  useEffect(() => {
    if (!enabled) return;
    connect();
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [connect, enabled]);
};

export default useKitchenSocket;
