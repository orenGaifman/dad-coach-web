'use client';

/**
 * StatusDictionaryPanel — displays a reference table of all workflow states
 * with their definitions, types, and possible actions.
 *
 * Features:
 * - Collapsible/expandable panel
 * - Table with state name, description, type (AI action vs State), and actions columns
 * - Color-coded badges for states and types
 * - Responsive design for mobile/desktop
 *
 * @see Requirements 2.16, 2.17, 2.18
 */

import { useState } from 'react';

/**
 * Definition for a workflow state displayed in the dictionary.
 */
interface StatusDefinition {
  /** Internal state identifier (e.g., 'WAITING') */
  state: string;
  /** Human-readable display name */
  displayName: string;
  /** Description of what this state represents */
  description: string;
  /** Type of state: 'state' for passive states, 'action' for AI-driven actions */
  type: 'state' | 'action';
  /** List of possible workflow actions that can occur in this state */
  possibleActions: string[];
}

/**
 * Complete list of workflow state definitions for the Dad Coach application.
 * This serves as a reference dictionary for developers debugging workflow issues.
 */
const STATUS_DEFINITIONS: StatusDefinition[] = [
  {
    state: 'WELCOME',
    displayName: 'Welcome',
    description: 'Initial state for new fathers. Explains Dad Coach and guides to first Quality Time scheduling.',
    type: 'state',
    possibleActions: ['TRANSITION_TO_SCHEDULE', 'EXPLAIN_AND_REPROMPT'],
  },
  {
    state: 'SCHEDULE_QUALITY_TIME',
    displayName: 'Schedule Quality Time',
    description: 'Active scheduling phase. Reads calendar, suggests time slots, and creates events when confirmed.',
    type: 'action',
    possibleActions: ['SELECT_SLOT', 'POSTPONE_SCHEDULING', 'SHOW_MORE_SLOTS', 'PARSE_TIME'],
  },
  {
    state: 'WAITING',
    displayName: 'Waiting',
    description: 'Passive state after QT is scheduled. Father waits for scheduled time. Morning reminders sent.',
    type: 'state',
    possibleActions: ['SHOW_SCHEDULE', 'RESCHEDULE', 'TRANSITION_TO_ACTIVITY_IDEAS', 'SHOW_DASHBOARD_SUMMARY'],
  },
  {
    state: 'QUALITY_TIME_PREPARATION',
    displayName: 'QT Preparation',
    description: 'Quality Time is about to start (within preparation window). Sends preparation tips and reminders.',
    type: 'state',
    possibleActions: ['SEND_PREP_REMINDER', 'TRANSITION_TO_IN_PROGRESS'],
  },
  {
    state: 'QUALITY_TIME_IN_PROGRESS',
    displayName: 'QT In Progress',
    description: 'Quality Time is currently happening. Limited interactions, focus on the activity.',
    type: 'state',
    possibleActions: ['CHECK_IN', 'TRANSITION_TO_FOLLOW_UP'],
  },
  {
    state: 'QUALITY_TIME_FOLLOW_UP',
    displayName: 'QT Follow-Up',
    description: 'Post-event state. Asks if father completed Quality Time, collects feedback, updates metrics.',
    type: 'action',
    possibleActions: ['MARK_COMPLETED', 'MARK_MISSED', 'COLLECT_FEEDBACK'],
  },
  {
    state: 'ACTIVITY_IDEAS',
    displayName: 'Activity Ideas',
    description: 'On-demand state for activity suggestions. Can be entered from any state, returns when done.',
    type: 'action',
    possibleActions: ['SHOW_IDEA_DETAILS', 'GENERATE_MORE_IDEAS', 'RETURN_TO_PREVIOUS'],
  },
  {
    state: 'BELT_PROMOTION',
    displayName: 'Belt Promotion',
    description: 'Father achieved a belt promotion. Celebrates achievement and transitions to next scheduling.',
    type: 'action',
    possibleActions: ['CELEBRATE', 'TRANSITION_TO_SCHEDULE'],
  },
];

/** Color mapping for state types */
const TYPE_COLORS: Record<string, string> = {
  state: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  action: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

/** Color mapping for workflow states (matches FatherStatePanel) */
const STATE_COLORS: Record<string, string> = {
  WELCOME: 'bg-blue-500/20 text-blue-300',
  WAITING: 'bg-gray-500/20 text-gray-300',
  SCHEDULE_QUALITY_TIME: 'bg-purple-500/20 text-purple-300',
  QUALITY_TIME_FOLLOW_UP: 'bg-green-500/20 text-green-300',
  QUALITY_TIME_PREPARATION: 'bg-cyan-500/20 text-cyan-300',
  QUALITY_TIME_IN_PROGRESS: 'bg-teal-500/20 text-teal-300',
  BELT_PROMOTION: 'bg-yellow-500/20 text-yellow-300',
  ACTIVITY_IDEAS: 'bg-orange-500/20 text-orange-300',
};

/**
 * Renders a state badge with appropriate colors.
 */
function StateBadge({ state, displayName }: { state: string; displayName: string }) {
  const colorClass = STATE_COLORS[state] || 'bg-gray-500/20 text-gray-300';

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorClass}`}>
      {displayName}
    </span>
  );
}

/**
 * Renders a type badge (State vs Action).
 */
function TypeBadge({ type }: { type: 'state' | 'action' }) {
  const colorClass = TYPE_COLORS[type];
  const label = type === 'state' ? 'State' : 'AI Action';

  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${colorClass}`}>
      {label}
    </span>
  );
}

/**
 * Renders the list of possible actions for a state.
 */
function ActionsList({ actions }: { actions: string[] }) {
  const visibleActions = actions.slice(0, 2);
  const remainingCount = actions.length - 2;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleActions.map((action) => (
        <span
          key={action}
          className="text-xs text-gray-400 bg-white/5 px-1.5 py-0.5 rounded"
        >
          {action.replace(/_/g, ' ')}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 italic">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

/**
 * Renders a single row in the status dictionary table.
 */
function StatusRow({ status }: { status: StatusDefinition }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-3 px-2">
        <StateBadge state={status.state} displayName={status.displayName} />
      </td>
      <td className="py-3 px-2 text-gray-300 text-sm">
        {status.description}
      </td>
      <td className="py-3 px-2">
        <TypeBadge type={status.type} />
      </td>
      <td className="py-3 px-2">
        <ActionsList actions={status.possibleActions} />
      </td>
    </tr>
  );
}

/**
 * StatusDictionaryPanel component — displays a collapsible reference table
 * of all workflow states with their definitions and possible actions.
 *
 * @see Requirements 2.16, 2.17, 2.18
 */
export function StatusDictionaryPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Header with collapse toggle */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isExpanded}
        aria-controls="status-dictionary-content"
      >
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📖</span> Status Dictionary
        </h3>
        <span
          className={`text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {/* Collapsed summary */}
      {!isExpanded && (
        <p className="text-gray-500 text-xs mt-2">
          Click to expand workflow state reference ({STATUS_DEFINITIONS.length} states)
        </p>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div id="status-dictionary-content" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-2 px-2 font-medium">State</th>
                  <th className="text-left py-2 px-2 font-medium">Description</th>
                  <th className="text-left py-2 px-2 font-medium">Type</th>
                  <th className="text-left py-2 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {STATUS_DEFINITIONS.map((status) => (
                  <StatusRow key={status.state} status={status} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-gray-500 text-xs">
              <span className="inline-flex items-center gap-1 mr-4">
                <TypeBadge type="state" /> Passive waiting states
              </span>
              <span className="inline-flex items-center gap-1">
                <TypeBadge type="action" /> AI-driven interaction states
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatusDictionaryPanel;
