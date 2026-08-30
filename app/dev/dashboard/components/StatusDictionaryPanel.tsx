'use client';

/**
 * StatusDictionaryPanel — displays reference tables for:
 * 1. Workflow states with their definitions, types, and possible actions
 * 2. AI Tools catalog showing what each tool does and its state transitions
 *
 * Features:
 * - Collapsible/expandable panels
 * - Tables with state/tool info, descriptions, and actions
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
 * Definition for an AI tool displayed in the tools catalog.
 */
interface AiToolDefinition {
  /** Tool name as used by the AI agent */
  toolName: string;
  /** Human-readable display name */
  displayName: string;
  /** Description of what this tool does */
  description: string;
  /** Category of tool */
  category: 'scheduling' | 'feedback' | 'info' | 'conversation' | 'goals';
  /** State transitions this tool can trigger (from -> to) */
  stateTransitions?: { from: string; to: string }[];
  /** Example parameters */
  exampleParams?: string[];
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

/**
 * Complete list of AI tools available to the coaching agent.
 * This serves as a reference for debugging AI behavior and understanding tool capabilities.
 */
const AI_TOOLS_CATALOG: AiToolDefinition[] = [
  // Scheduling tools
  {
    toolName: 'schedule_quality_time',
    displayName: 'Schedule Quality Time',
    description: 'Schedules a new Quality Time session with a specific child at a given time.',
    category: 'scheduling',
    stateTransitions: [
      { from: 'WELCOME', to: 'WAITING' },
      { from: 'SCHEDULE_QUALITY_TIME', to: 'WAITING' },
      { from: 'QUALITY_TIME_FOLLOW_UP', to: 'WAITING' },
    ],
    exampleParams: ['child_name', 'date', 'time', 'duration'],
  },
  {
    toolName: 'reschedule_quality_time',
    displayName: 'Reschedule Quality Time',
    description: 'Reschedules an existing Quality Time session to a new time.',
    category: 'scheduling',
    exampleParams: ['quality_time_id', 'new_date', 'new_time'],
  },
  {
    toolName: 'cancel_quality_time',
    displayName: 'Cancel Quality Time',
    description: 'Cancels an existing scheduled Quality Time session.',
    category: 'scheduling',
    stateTransitions: [{ from: 'WAITING', to: 'SCHEDULE_QUALITY_TIME' }],
    exampleParams: ['quality_time_id', 'reason'],
  },
  {
    toolName: 'show_available_slots',
    displayName: 'Show Available Slots',
    description: 'Shows available time slots from the father\'s calendar for scheduling.',
    category: 'scheduling',
    exampleParams: ['date_range', 'child_name'],
  },
  {
    toolName: 'complete_quality_time',
    displayName: 'Complete Quality Time',
    description: 'Marks a Quality Time session as completed, records feedback and updates metrics.',
    category: 'feedback',
    stateTransitions: [
      { from: 'QUALITY_TIME_IN_PROGRESS', to: 'QUALITY_TIME_FOLLOW_UP' },
      { from: 'QUALITY_TIME_FOLLOW_UP', to: 'SCHEDULE_QUALITY_TIME' },
    ],
    exampleParams: ['quality_time_id', 'rating', 'activity_done', 'notes'],
  },
  // Information tools
  {
    toolName: 'get_activity_ideas',
    displayName: 'Get Activity Ideas',
    description: 'Generates age-appropriate activity suggestions for a specific child.',
    category: 'info',
    exampleParams: ['child_name', 'activity_type', 'duration'],
  },
  {
    toolName: 'show_progress',
    displayName: 'Show Progress',
    description: 'Shows the father\'s progress stats, streaks, and belt level.',
    category: 'info',
  },
  {
    toolName: 'get_dashboard_link',
    displayName: 'Get Dashboard Link',
    description: 'Generates a magic link to the web dashboard for the father.',
    category: 'info',
  },
  {
    toolName: 'show_weekly_summary',
    displayName: 'Show Weekly Summary',
    description: 'Shows the weekly summary of Quality Time sessions and progress.',
    category: 'info',
  },
  // Goals tools
  {
    toolName: 'set_weekly_goal',
    displayName: 'Set Weekly Goal',
    description: 'Sets a weekly goal for number of Quality Time sessions.',
    category: 'goals',
    exampleParams: ['goal_count'],
  },
  {
    toolName: 'get_weekly_goal_status',
    displayName: 'Get Weekly Goal Status',
    description: 'Shows progress towards the weekly goal.',
    category: 'goals',
  },
  // Conversation tools
  {
    toolName: 'greet',
    displayName: 'Greet',
    description: 'Sends a greeting message when father initiates conversation.',
    category: 'conversation',
  },
  {
    toolName: 'show_help',
    displayName: 'Show Help',
    description: 'Shows available commands and capabilities of the bot.',
    category: 'conversation',
  },
  {
    toolName: 'clarify',
    displayName: 'Clarify',
    description: 'Asks clarifying questions when user intent is unclear.',
    category: 'conversation',
  },
  {
    toolName: 'acknowledge',
    displayName: 'Acknowledge',
    description: 'Acknowledges user messages and provides intelligent responses.',
    category: 'conversation',
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

/** Color mapping for tool categories */
const CATEGORY_COLORS: Record<string, string> = {
  scheduling: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  feedback: 'bg-green-500/20 text-green-300 border-green-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  conversation: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  goals: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

/** Category icons */
const CATEGORY_ICONS: Record<string, string> = {
  scheduling: '📅',
  feedback: '✅',
  info: 'ℹ️',
  conversation: '💬',
  goals: '🎯',
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
 * Renders a category badge for tools.
 */
function CategoryBadge({ category }: { category: string }) {
  const colorClass = CATEGORY_COLORS[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  const icon = CATEGORY_ICONS[category] || '🔧';

  return (
    <span className={`text-xs px-2 py-0.5 rounded border inline-flex items-center gap-1 ${colorClass}`}>
      <span>{icon}</span>
      {category}
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
 * Renders state transitions for a tool.
 */
function StateTransitions({ transitions }: { transitions?: { from: string; to: string }[] }) {
  if (!transitions || transitions.length === 0) {
    return <span className="text-gray-500 text-xs italic">No state change</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {transitions.slice(0, 2).map((t, i) => (
        <div key={i} className="text-xs flex items-center gap-1">
          <span className={`px-1.5 py-0.5 rounded ${STATE_COLORS[t.from] || 'bg-gray-500/20 text-gray-300'}`}>
            {t.from.replace(/_/g, ' ')}
          </span>
          <span className="text-gray-500">→</span>
          <span className={`px-1.5 py-0.5 rounded ${STATE_COLORS[t.to] || 'bg-gray-500/20 text-gray-300'}`}>
            {t.to.replace(/_/g, ' ')}
          </span>
        </div>
      ))}
      {transitions.length > 2 && (
        <span className="text-xs text-gray-500 italic">+{transitions.length - 2} more</span>
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
 * Renders a single row in the AI tools catalog table.
 */
function ToolRow({ tool }: { tool: AiToolDefinition }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-3 px-2">
        <div className="flex flex-col gap-1">
          <code className="text-xs text-amber-300 bg-amber-500/10 px-2 py-1 rounded font-mono">
            {tool.toolName}
          </code>
          <span className="text-gray-400 text-xs">{tool.displayName}</span>
        </div>
      </td>
      <td className="py-3 px-2 text-gray-300 text-sm">
        {tool.description}
      </td>
      <td className="py-3 px-2">
        <CategoryBadge category={tool.category} />
      </td>
      <td className="py-3 px-2">
        <StateTransitions transitions={tool.stateTransitions} />
      </td>
    </tr>
  );
}

/**
 * StatusDictionaryPanel component — displays collapsible reference tables
 * for workflow states and AI tools.
 *
 * @see Requirements 2.16, 2.17, 2.18
 */
export function StatusDictionaryPanel() {
  const [isStatesExpanded, setIsStatesExpanded] = useState(false);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Workflow States Dictionary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        {/* Header with collapse toggle */}
        <button
          onClick={() => setIsStatesExpanded(!isStatesExpanded)}
          className="w-full flex items-center justify-between text-left"
          aria-expanded={isStatesExpanded}
          aria-controls="status-dictionary-content"
        >
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span>📖</span> Workflow States Dictionary
          </h3>
          <span
            className={`text-gray-400 transition-transform duration-200 ${
              isStatesExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>

        {/* Collapsed summary */}
        {!isStatesExpanded && (
          <p className="text-gray-500 text-xs mt-2">
            Click to expand workflow state reference ({STATUS_DEFINITIONS.length} states)
          </p>
        )}

        {/* Expanded content */}
        {isStatesExpanded && (
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

      {/* AI Tools Catalog */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        {/* Header with collapse toggle */}
        <button
          onClick={() => setIsToolsExpanded(!isToolsExpanded)}
          className="w-full flex items-center justify-between text-left"
          aria-expanded={isToolsExpanded}
          aria-controls="tools-catalog-content"
        >
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span>🧠</span> AI Tools Catalog
          </h3>
          <span
            className={`text-gray-400 transition-transform duration-200 ${
              isToolsExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>

        {/* Collapsed summary */}
        {!isToolsExpanded && (
          <p className="text-gray-500 text-xs mt-2">
            Click to expand AI tools reference ({AI_TOOLS_CATALOG.length} tools available)
          </p>
        )}

        {/* Expanded content */}
        {isToolsExpanded && (
          <div id="tools-catalog-content" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-left py-2 px-2 font-medium">Tool Name</th>
                    <th className="text-left py-2 px-2 font-medium">Description</th>
                    <th className="text-left py-2 px-2 font-medium">Category</th>
                    <th className="text-left py-2 px-2 font-medium">State Transitions</th>
                  </tr>
                </thead>
                <tbody>
                  {AI_TOOLS_CATALOG.map((tool) => (
                    <ToolRow key={tool.toolName} tool={tool} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-gray-500 text-xs flex flex-wrap gap-2">
                {Object.entries(CATEGORY_COLORS).map(([category]) => (
                  <span key={category} className="inline-flex items-center">
                    <CategoryBadge category={category} />
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusDictionaryPanel;
