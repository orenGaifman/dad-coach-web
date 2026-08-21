/**
 * Type definitions for the Father Workspace (WEB-SPEC-008).
 *
 * This module exports all workspace-related types for use by
 * services, hooks, and components.
 */

// Common types (pagination, errors, base responses)
export * from './common';

// Workspace summary and profile types
export * from './workspace';

// Growth types (belt, score, streak, achievements, celebrations)
export * from './growth';

// Family types (children, goals, missions)
export * from './family';

// Coaching types (conversations, activity logging)
export * from './coaching';

// Notification types
export * from './notifications';

// Quality Time types (workflow engine, scheduling, progress)
export * from './qualityTime';

// Weekly Goal types (7-week program, goals, progress)
export * from './weeklyGoal';

// Dev Dashboard types (debugging, state inspection)
export * from './dev';
