/**
 * Onboarding API service layer.
 *
 * Wraps all onboarding-related backend endpoints using the shared apiClient.
 * Each function is typed against the onboarding type definitions.
 */

import { apiClient } from '@/src/lib/api-client';
import type {
  ActivationRetryResponse,
  ActivationStatus,
  InvitationValidation,
  ProvisioningResponse,
  SessionCreateResponse,
  SessionState,
  StepResponse,
} from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Invitation
// ---------------------------------------------------------------------------

/**
 * Validate an invitation token.
 * GET /api/v1/invitations/{token}/validate
 */
export async function validateInvitation(token: string): Promise<InvitationValidation> {
  return apiClient.get<InvitationValidation>(`/invitations/${encodeURIComponent(token)}/validate`);
}

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------

/**
 * Create a new onboarding session from an invitation token.
 * POST /api/v1/onboarding/sessions
 */
export async function createSession(token: string): Promise<SessionCreateResponse> {
  return apiClient.post<SessionCreateResponse>('/onboarding/sessions', {
    invitation_token: token,
  });
}

/**
 * Retrieve current session state (for resume / restore).
 * GET /api/v1/onboarding/sessions/{id}
 */
export async function getSession(sessionId: string): Promise<SessionState> {
  return apiClient.get<SessionState>(`/onboarding/sessions/${encodeURIComponent(sessionId)}`);
}

// ---------------------------------------------------------------------------
// Step submission
// ---------------------------------------------------------------------------

/**
 * Submit data for a specific onboarding step.
 * PUT /api/v1/onboarding/sessions/{id}/steps/{step}
 */
export async function submitStep(
  sessionId: string,
  step: string,
  data: unknown,
): Promise<StepResponse> {
  return apiClient.put<StepResponse>(
    `/onboarding/sessions/${encodeURIComponent(sessionId)}/steps/${encodeURIComponent(step)}`,
    data,
  );
}

// ---------------------------------------------------------------------------
// Completion & provisioning
// ---------------------------------------------------------------------------

/**
 * Complete the onboarding and trigger account provisioning.
 * POST /api/v1/onboarding/sessions/{id}/complete
 */
export async function completeOnboarding(sessionId: string): Promise<ProvisioningResponse> {
  return apiClient.post<ProvisioningResponse>(
    `/onboarding/sessions/${encodeURIComponent(sessionId)}/complete`,
    {},
  );
}

// ---------------------------------------------------------------------------
// Activation polling & retry
// ---------------------------------------------------------------------------

/**
 * Get WhatsApp activation status (long-polling, 30s server hold).
 * GET /api/v1/onboarding/sessions/{id}/activation-status
 *
 * Pass an AbortSignal to cancel the long-poll on component unmount.
 */
export async function getActivationStatus(
  sessionId: string,
  signal?: AbortSignal,
): Promise<ActivationStatus> {
  return apiClient.get<ActivationStatus>(
    `/onboarding/sessions/${encodeURIComponent(sessionId)}/activation-status`,
    { signal },
  );
}

/**
 * Retry WhatsApp activation (max 3 retries enforced by backend).
 * POST /api/v1/onboarding/sessions/{id}/activation/retry
 */
export async function retryActivation(sessionId: string): Promise<ActivationRetryResponse> {
  return apiClient.post<ActivationRetryResponse>(
    `/onboarding/sessions/${encodeURIComponent(sessionId)}/activation/retry`,
  );
}
