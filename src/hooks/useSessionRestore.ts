'use client';

import { useEffect, useState } from 'react';

import { ApiError } from '@/src/lib/api-client';
import { getSession } from '@/src/services/onboarding';
import type { SessionState } from '@/src/types/onboarding';

interface UseSessionRestoreResult {
  /** Whether the restore attempt is still in progress. */
  isRestoring: boolean;
  /** The restored session state, or null if no session found. */
  restoredState: SessionState | null;
  /** Error info if session is expired or revoked. */
  error: 'expired' | 'not_found' | null;
}

/**
 * useSessionRestore — attempts to restore an existing onboarding session.
 *
 * On mount, calls GET /api/v1/onboarding/sessions/{id} (if sessionId provided).
 * If session is IN_PROGRESS, returns the state for the provider to populate.
 * If session is EXPIRED (403), returns error='expired'.
 * If no session found (404), returns error='not_found'.
 *
 * @param sessionId - The session ID to restore. If null, does nothing.
 */
export function useSessionRestore(sessionId: string | null): UseSessionRestoreResult {
  const [isRestoring, setIsRestoring] = useState(!!sessionId);
  const [restoredState, setRestoredState] = useState<SessionState | null>(null);
  const [error, setError] = useState<'expired' | 'not_found' | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setIsRestoring(false);
      return;
    }

    let cancelled = false;

    async function restore() {
      try {
        const session = await getSession(sessionId!);
        if (cancelled) return;

        if (session.status === 'IN_PROGRESS') {
          setRestoredState(session);
        } else if (session.status === 'EXPIRED') {
          setError('expired');
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (err instanceof ApiError) {
          if (err.status === 403) {
            setError('expired');
          } else if (err.status === 404) {
            setError('not_found');
          }
        }
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    }

    restore();
    return () => { cancelled = true; };
  }, [sessionId]);

  return { isRestoring, restoredState, error };
}
