/**
 * Types for Quality Time Commitments.
 *
 * Represents father's commitments to spend quality time with children
 * at scheduled times.
 */

/**
 * Status of a quality time commitment.
 */
export type CommitmentStatus = 'SCHEDULED' | 'REMINDED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';

/**
 * A single commitment record.
 */
export interface Commitment {
  id: number;
  childId: number | null;
  childName: string | null;
  scheduledAt: string; // ISO timestamp
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  durationMinutes: number | null;
  activityType: string | null;
  activityNote: string | null;
  status: CommitmentStatus;
  completedAt: string | null;
  pointsAwarded: number;
  createdAt: string;
}

/**
 * Response from GET /api/v1/workspace/commitments
 */
export type CommitmentsResponse = Commitment[];

/**
 * Response from GET /api/v1/workspace/commitments/upcoming
 */
export type UpcomingCommitmentsResponse = Commitment[];

/**
 * Response from GET /api/v1/workspace/commitments/stats
 */
export interface CommitmentStatsResponse {
  completed: number;
  upcoming: number;
  missed: number;
  total: number;
  completionRate: number;
}

/**
 * Request to create a new commitment.
 */
export interface CreateCommitmentRequest {
  childId?: number | null;
  scheduledAt: string; // ISO timestamp
  activityType?: string | null;
  activityNote?: string | null;
}

/**
 * Request to complete a commitment.
 */
export interface CompleteCommitmentRequest {
  note?: string;
}
