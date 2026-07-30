'use client';

import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';

import { getActivationStatus } from '@/src/services/onboarding';
import type { ActivationStatus, ActivationPollingStatus } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseActivationPollingResult {
  /** Current activation status (PENDING | CONVERSATION_STARTED | FAILED). */
  status: ActivationPollingStatus | null;
  /** Full activation data payload from the backend. */
  activationData: ActivationStatus | null;
  /** Whether the polling loop is actively running. */
  isPolling: boolean;
  /** Transient error message (connection issues). */
  error: string | null;
  /** Restart polling after a failure or retry. */
  restart: () => void;
}

interface PollingState {
  status: ActivationPollingStatus | null;
  activationData: ActivationStatus | null;
  isPolling: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useActivationPolling — long-poll loop for WhatsApp activation status.
 *
 * Continuously fetches activation status (server holds each request for ~30s)
 * until the status transitions to CONVERSATION_STARTED or FAILED. Cleans up
 * via AbortController on unmount.
 *
 * @param sessionId - The onboarding session ID. Polling starts when non-null.
 *
 * @see Requirement 9.3: Long-poll GET /activation-status with 30s server hold.
 */
export function useActivationPolling(
  sessionId: string | null,
): UseActivationPollingResult {
  const stateRef = useRef<PollingState>({
    status: null,
    activationData: null,
    isPolling: false,
    error: null,
  });
  const subscribersRef = useRef(new Set<() => void>());
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const notify = useCallback(() => {
    subscribersRef.current.forEach((cb) => cb());
  }, []);

  const subscribe = useCallback((cb: () => void) => {
    subscribersRef.current.add(cb);
    return () => { subscribersRef.current.delete(cb); };
  }, []);

  const getSnapshot = useCallback(() => stateRef.current, []);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const poll = useCallback(async () => {
    if (!sessionId) return;

    stateRef.current = { ...stateRef.current, isPolling: true, error: null };
    notify();

    while (isMountedRef.current) {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await getActivationStatus(sessionId, controller.signal);

        if (!isMountedRef.current) break;

        // Terminal states — stop polling.
        if (result.status === 'CONVERSATION_STARTED' || result.status === 'FAILED') {
          stateRef.current = {
            status: result.status,
            activationData: result,
            isPolling: false,
            error: null,
          };
          notify();
          break;
        }

        // PENDING — update state and loop (server already held for 30s).
        stateRef.current = {
          status: result.status,
          activationData: result,
          isPolling: true,
          error: null,
        };
        notify();
      } catch (err: unknown) {
        if (!isMountedRef.current) break;

        // Abort is expected on unmount / restart — exit silently.
        if (err instanceof Error && err.name === 'AbortError') break;

        // Network / timeout error — brief pause then retry.
        stateRef.current = { ...stateRef.current, error: 'Connection issue — retrying...' };
        notify();
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }, [sessionId, notify]);

  // Start polling when sessionId becomes available.
  useEffect(() => {
    isMountedRef.current = true;

    if (sessionId) {
      // Defer polling start to avoid synchronous setState in effect body.
      const id = requestAnimationFrame(() => { poll(); });
      return () => {
        cancelAnimationFrame(id);
        isMountedRef.current = false;
        abortControllerRef.current?.abort();
      };
    }

    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [sessionId, poll]);

  // Restart — abort current request, reset state, begin fresh loop.
  const restart = useCallback(() => {
    abortControllerRef.current?.abort();
    stateRef.current = { status: null, activationData: null, isPolling: false, error: null };
    notify();
    poll();
  }, [poll, notify]);

  return {
    status: state.status,
    activationData: state.activationData,
    isPolling: state.isPolling,
    error: state.error,
    restart,
  };
}
