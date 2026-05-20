/**
 * Realtime Provider
 * React context provider that syncs realtime events to TanStack Query
 * Orchestrates connection, event handling, and cache invalidation
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RealtimeClient, type RealtimeClientConfig } from '../lib/realtime/realtime-client';
import type { RealtimeEvent } from '../lib/realtime/realtime-events';
import {
  RealtimeEventType,
  EVENT_ROLE_FILTERS
} from '../lib/realtime/realtime-events';
import { queryKeys } from '../lib/query-keys';
import { useRole } from '../hooks/use-role';
import { logger } from '../lib/logger';
import { getEnv } from '../config/env';

interface RealtimeContextValue {
  client: RealtimeClient | null;
  isConnected: boolean;
  isReconnecting: boolean;
  subscribe: (eventType: RealtimeEventType | 'all', listener: (event: RealtimeEvent) => void) => () => void;
  emit: (event: RealtimeEvent) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

interface RealtimeProviderProps {
  children: React.ReactNode;
  config?: RealtimeClientConfig;
}

export function RealtimeProvider({ children, config }: RealtimeProviderProps) {
  const queryClient = useQueryClient();
  const userRole = useRole();
  const clientRef = useRef<RealtimeClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const unsubscribeRef = useRef<(() => void)[]>([]);

  // Get allowed event types based on user role
  const allowedEventTypes = userRole ? EVENT_ROLE_FILTERS[userRole] || [] : [];

  // Initialize realtime client
  useEffect(() => {
    const defaultRealtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL ?? (() => {
      try {
        const api = new URL(getEnv().NEXT_PUBLIC_API_URL);
        api.protocol = api.protocol === 'https:' ? 'wss:' : 'ws:';
        api.pathname = '/realtime';
        return api.toString();
      } catch {
        return 'ws://localhost:3002/realtime';
      }
    })();

    const defaultConfig: RealtimeClientConfig = {
      url: defaultRealtimeUrl,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      pingInterval: 30000,
      ...config
    };

    const client = new RealtimeClient(defaultConfig);
    clientRef.current = client;

    // Connect to realtime server
    client.connect().catch((error) => {
      logger.error('[RealtimeProvider] Failed to connect', String(error));
    });

    return () => {
      client.disconnect();
      unsubscribeRef.current.forEach((unsub) => unsub());
    };
  }, [config]);

  // Handle realtime events
  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    // Update connection state
    const unsubConnection = client.on('all', (event) => {
      if (event.type === RealtimeEventType.CONNECTION_ESTABLISHED) {
        setIsConnected(true);
        setIsReconnecting(false);
      } else if (event.type === RealtimeEventType.CONNECTION_LOST) {
        setIsConnected(false);
      } else if (event.type === RealtimeEventType.CONNECTION_RECONNECTED) {
        setIsConnected(true);
        setIsReconnecting(false);
      }
    });

    // Handle query invalidation for different event types
    const unsubEvents = client.on('all', (event) => {
      // Check if event is allowed for this role
      if (!allowedEventTypes.includes(event.type as RealtimeEventType)) {
        return;
      }

      handleEventInvalidation(event, queryClient);
    });

    unsubscribeRef.current.push(unsubConnection, unsubEvents);

    return () => {
      unsubConnection();
      unsubEvents();
    };
  }, [queryClient, allowedEventTypes]);

  // Subscribe handler
  const subscribe = useCallback(
    (eventType: RealtimeEventType | 'all', listener: (event: RealtimeEvent) => void) => {
      const client = clientRef.current;
      if (!client) return () => {};

      return client.on(eventType, (event) => {
        // Apply role-based filtering
        if (
          eventType !== 'all' &&
          !allowedEventTypes.includes(eventType as RealtimeEventType)
        ) {
          return;
        }
        listener(event);
      });
    },
    [allowedEventTypes]
  );

  // Emit handler (for testing or internal use)
  const emit = useCallback((_event: RealtimeEvent) => {
    const client = clientRef.current;
    if (!client) return;
    // NOTE: In production, events come from the server
    // This is mainly for testing purposes
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        client: clientRef.current,
        isConnected,
        isReconnecting,
        subscribe,
        emit
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to access realtime context
 * DO NOT use this directly in components - use specific hooks like useRealtimeClaims
 */
export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}

/**
 * Handle query invalidation based on realtime event
 * Maps realtime events to cache invalidation logic
 */
function handleEventInvalidation(event: RealtimeEvent, queryClient: any): void {
  switch (event.type) {
    // Claim events
    case RealtimeEventType.CLAIM_CREATED:
    case RealtimeEventType.CLAIM_UPDATED:
    case RealtimeEventType.CLAIM_ASSIGNED:
    case RealtimeEventType.CLAIM_STATUS_CHANGED:
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.lists() });
      if (event.claimId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.claims.detail(event.claimId) });
      }
      break;

    case RealtimeEventType.CLAIM_ARCHIVED:
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.lists() });
      if (event.claimId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.claims.detail(event.claimId) });
      }
      break;

    // Evidence events
    case RealtimeEventType.EVIDENCE_ADDED:
    case RealtimeEventType.EVIDENCE_UPDATED:
    case RealtimeEventType.EVIDENCE_SCORED:
      if (event.claimId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.evidence.byClaim(event.claimId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.claims.evidence(event.claimId) });
        // Evidence addition affects verdict readiness
        queryClient.invalidateQueries({ queryKey: queryKeys.verdicts.detail(event.claimId) });
      }
      break;

    // Investigation events
    case RealtimeEventType.INVESTIGATION_STARTED:
    case RealtimeEventType.INVESTIGATION_UPDATED:
    case RealtimeEventType.INVESTIGATION_COMPLETED:
      queryClient.invalidateQueries({ queryKey: queryKeys.investigations.lists() });
      if (event.investigationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.investigations.detail(event.investigationId)
        });
      }
      break;

    // Verdict events
    case RealtimeEventType.VERDICT_COMPUTED:
    case RealtimeEventType.VERDICT_READY:
    case RealtimeEventType.VERDICT_APPROVED:
    case RealtimeEventType.VERDICT_REJECTED:
    case RealtimeEventType.VERDICT_PUBLISHED:
    case RealtimeEventType.VERDICT_RECOMPUTED:
      queryClient.invalidateQueries({ queryKey: queryKeys.verdicts.lists() });
      if (event.claimId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.verdicts.detail(event.claimId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.verdicts.history(event.claimId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.claims.detail(event.claimId) });
      }
      break;

    // Moderation events
    case RealtimeEventType.MODERATION_STARTED:
    case RealtimeEventType.MODERATION_COMMENT_ADDED:
    case RealtimeEventType.MODERATION_ACTION_TAKEN:
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.lists() });
      if (event.claimId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.audit.detail(event.claimId) });
      }
      break;

    // System events - no query invalidation
    case RealtimeEventType.SYSTEM_HEALTH_CHECK:
    case RealtimeEventType.CONNECTION_ESTABLISHED:
    case RealtimeEventType.CONNECTION_LOST:
    case RealtimeEventType.CONNECTION_RECONNECTED:
      break;
  }
}
