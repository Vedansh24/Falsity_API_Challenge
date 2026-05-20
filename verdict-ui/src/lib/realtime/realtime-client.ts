/**
 * Realtime Client
 * Manages WebSocket connection and event dispatching
 * Backend-agnostic design for flexibility
 */

import type { RealtimeEvent, RealtimeEventType } from './realtime-events';
import { logger } from '../logger';

type EventListener = (event: RealtimeEvent) => void;
type EventListenerMap = Map<RealtimeEventType | 'all', Set<EventListener>>;

export interface RealtimeClientConfig {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
}

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectDelay: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private listeners: EventListenerMap = new Map();
  private shouldReconnect = true;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(config: RealtimeClientConfig) {
    this.url = config.url;
    this.reconnectDelay = config.reconnectDelay || 3000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          logger.log('[RealtimeClient] Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit({
            type: 'connection:established',
            timestamp: Date.now(),
            userId: 'system',
            userRole: 'system',
            payload: {}
          } as any);
          this.setupPing();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as RealtimeEvent;
            this.handleMessage(data);
          } catch (error) {
            logger.error('[RealtimeClient] Failed to parse message', String(error));
          }
        };

        this.ws.onerror = (error) => {
          logger.error('[RealtimeClient] Connection error', String(error));
          reject(error);
        };

        this.ws.onclose = () => {
          logger.log('[RealtimeClient] Disconnected');
          this.isConnected = false;
          this.clearPing();
          this.emit({
            type: 'connection:lost',
            timestamp: Date.now(),
            userId: 'system',
            userRole: 'system',
            payload: {}
          } as any);
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    this.clearPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Subscribe to events
   */
  on(eventType: RealtimeEventType | 'all', listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Subscribe to single event, auto-unsubscribe after
   */
  once(eventType: RealtimeEventType | 'all', listener: EventListener): () => void {
    const unsubscribe = this.on(eventType, (event) => {
      listener(event);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: RealtimeEvent): void {
    // Fire specific event listeners
    const typeListeners = this.listeners.get(event.type as RealtimeEventType);
    typeListeners?.forEach((listener) => listener(event));

    // Fire 'all' listeners
    const allListeners = this.listeners.get('all');
    allListeners?.forEach((listener) => listener(event));
  }

  /**
   * Handle incoming message
   */
  private handleMessage(event: RealtimeEvent): void {
    this.emit(event);
  }

  /**
   * Setup keep-alive ping
   */
  private setupPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // 30 seconds
  }

  /**
   * Clear ping interval
   */
  private clearPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    logger.log(`[RealtimeClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        logger.error('[RealtimeClient] Reconnection failed', String(error));
      });
    }, delay);
  }
}

/**
 * Global realtime client instance
 */
let realtimeClientInstance: RealtimeClient | null = null;

export function createRealtimeClient(config: RealtimeClientConfig): RealtimeClient {
  if (!realtimeClientInstance) {
    realtimeClientInstance = new RealtimeClient(config);
  }
  return realtimeClientInstance;
}

export function getRealtimeClient(): RealtimeClient | null {
  return realtimeClientInstance;
}
