'use client';

/**
 * StateFlowDiagram — Interactive visualization of the workflow state machine.
 *
 * Features:
 * - Displays all 13 workflow states in a visual diagram
 * - Shows valid transitions as arrows between states
 * - Highlights the current user's state
 * - Groups states by category (onboarding, main flow, weekly goal flow, overlay)
 * - Shows state descriptions on hover
 * - Color-coded by state category
 *
 * @see WorkflowState.java for state definitions and transitions
 */

import { useMemo } from 'react';
import type { ReactElement } from 'react';

interface StateFlowDiagramProps {
  /** Current workflow state of the selected father */
  currentState: string | null;
  /** Previous workflow state for context */
  previousState?: string | null;
}

/** State definition with metadata */
interface StateDefinition {
  id: string;
  label: string;
  description: string;
  category: 'onboarding' | 'main' | 'weekly' | 'overlay' | 'internal';
  validTransitions: string[];
}

/** All workflow states with their transitions (matching WorkflowState.java) */
const STATES: StateDefinition[] = [
  // Onboarding
  {
    id: 'WELCOME',
    label: 'Welcome',
    description: 'Initial state for new fathers. Explains Dad Coach, guides to first Quality Time.',
    category: 'onboarding',
    validTransitions: ['SCHEDULE_QUALITY_TIME', 'SET_WEEKLY_GOAL'],
  },
  
  // Main Flow
  {
    id: 'SCHEDULE_QUALITY_TIME',
    label: 'Schedule QT',
    description: 'Active scheduling state. Reads Google Calendar, suggests slots, creates events.',
    category: 'main',
    validTransitions: ['WAITING', 'ACTIVITY_IDEAS'],
  },
  {
    id: 'WAITING',
    label: 'Waiting',
    description: 'Passive waiting state. Daily morning reminder if Quality Time exists today.',
    category: 'main',
    validTransitions: ['QUALITY_TIME_REMINDER', 'QUALITY_TIME_FOLLOW_UP', 'SCHEDULE_QUALITY_TIME', 'ACTIVITY_IDEAS', 'WEEKLY_SUMMARY', 'INACTIVITY_NUDGE'],
  },
  {
    id: 'QUALITY_TIME_REMINDER',
    label: 'QT Reminder',
    description: 'Pre-event reminder state. Entered 1 hour before Quality Time starts.',
    category: 'main',
    validTransitions: ['QUALITY_TIME_FOLLOW_UP', 'WAITING'],
  },
  {
    id: 'QUALITY_TIME_FOLLOW_UP',
    label: 'QT Follow-up',
    description: 'Post-event state. Asks if father completed Quality Time, updates dashboard.',
    category: 'main',
    validTransitions: ['UPDATE_PROGRESS', 'SCHEDULE_QUALITY_TIME', 'WEEKLY_SUMMARY'],
  },
  {
    id: 'UPDATE_PROGRESS',
    label: 'Update Progress',
    description: 'Internal state for updating progress. Updates WeeklyGoal, checks belt promotion.',
    category: 'internal',
    validTransitions: ['SCHEDULE_QUALITY_TIME', 'WAITING'],
  },
  {
    id: 'INACTIVITY_NUDGE',
    label: 'Inactivity Nudge',
    description: 'Entered after 3 days of no interaction. Sends re-engagement message.',
    category: 'main',
    validTransitions: ['WAITING', 'SCHEDULE_QUALITY_TIME'],
  },
  
  // Weekly Goal Flow
  {
    id: 'WEEKLY_SUMMARY',
    label: 'Weekly Summary',
    description: 'Shows last week\'s results before setting new goal. Triggered at start of week.',
    category: 'weekly',
    validTransitions: ['SET_WEEKLY_GOAL'],
  },
  {
    id: 'SET_WEEKLY_GOAL',
    label: 'Set Weekly Goal',
    description: 'Goal selection state. Father chooses weekly hours target (1-5+ hours).',
    category: 'weekly',
    validTransitions: ['DISTRIBUTE_GOAL', 'SCHEDULE_WEEK'],
  },
  {
    id: 'DISTRIBUTE_GOAL',
    label: 'Distribute Goal',
    description: 'Goal distribution state. Divides hours among children (if multiple).',
    category: 'weekly',
    validTransitions: ['SCHEDULE_WEEK'],
  },
  {
    id: 'SCHEDULE_WEEK',
    label: 'Schedule Week',
    description: 'Week scheduling state. Plans specific quality time slots for the week.',
    category: 'weekly',
    validTransitions: ['WAITING'],
  },
  
  // Overlay States
  {
    id: 'ACTIVITY_IDEAS',
    label: 'Activity Ideas',
    description: 'On-demand state. Returns to previous state when done.',
    category: 'overlay',
    validTransitions: ['WELCOME', 'SCHEDULE_QUALITY_TIME', 'WAITING', 'QUALITY_TIME_FOLLOW_UP', 'QUALITY_TIME_REMINDER'],
  },
  {
    id: 'DASHBOARD',
    label: 'Dashboard',
    description: 'Frontend-only state for dashboard display. Not persisted in WhatsApp flow.',
    category: 'overlay',
    validTransitions: [],
  },
];

/** Category colors and labels */
const CATEGORY_STYLES: Record<string, { bg: string; border: string; label: string; color: string }> = {
  onboarding: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    label: 'Onboarding',
    color: '#3b82f6',
  },
  main: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    label: 'Main Flow',
    color: '#22c55e',
  },
  weekly: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    label: 'Weekly Goal',
    color: '#a855f7',
  },
  overlay: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    label: 'Overlay',
    color: '#f97316',
  },
  internal: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/50',
    label: 'Internal',
    color: '#6b7280',
  },
};

/** Position configuration for each state in the diagram */
const STATE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Onboarding - Top left
  WELCOME: { x: 50, y: 50 },
  
  // Main Flow - Center column
  SCHEDULE_QUALITY_TIME: { x: 200, y: 50 },
  WAITING: { x: 350, y: 150 },
  QUALITY_TIME_REMINDER: { x: 500, y: 50 },
  QUALITY_TIME_FOLLOW_UP: { x: 500, y: 150 },
  UPDATE_PROGRESS: { x: 350, y: 250 },
  INACTIVITY_NUDGE: { x: 200, y: 250 },
  
  // Weekly Goal Flow - Bottom row
  WEEKLY_SUMMARY: { x: 50, y: 350 },
  SET_WEEKLY_GOAL: { x: 200, y: 350 },
  DISTRIBUTE_GOAL: { x: 350, y: 350 },
  SCHEDULE_WEEK: { x: 500, y: 350 },
  
  // Overlay States - Right side
  ACTIVITY_IDEAS: { x: 650, y: 150 },
  DASHBOARD: { x: 650, y: 250 },
};

/** Node dimensions */
const NODE_WIDTH = 120;
const NODE_HEIGHT = 50;

/**
 * Calculates the connection points for an arrow between two states
 */
function getArrowPoints(fromId: string, toId: string): { x1: number; y1: number; x2: number; y2: number } | null {
  const from = STATE_POSITIONS[fromId];
  const to = STATE_POSITIONS[toId];
  
  if (!from || !to) return null;
  
  // Calculate center points
  const fromCenterX = from.x + NODE_WIDTH / 2;
  const fromCenterY = from.y + NODE_HEIGHT / 2;
  const toCenterX = to.x + NODE_WIDTH / 2;
  const toCenterY = to.y + NODE_HEIGHT / 2;
  
  // Calculate direction
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return null;
  
  // Normalize direction
  const nx = dx / distance;
  const ny = dy / distance;
  
  // Calculate edge points
  const x1 = fromCenterX + nx * (NODE_WIDTH / 2);
  const y1 = fromCenterY + ny * (NODE_HEIGHT / 2);
  const x2 = toCenterX - nx * (NODE_WIDTH / 2 + 8); // 8px for arrow head
  const y2 = toCenterY - ny * (NODE_HEIGHT / 2 + 8);
  
  return { x1, y1, x2, y2 };
}

/**
 * Renders a single state node
 */
function StateNode({ 
  state, 
  isCurrent, 
  isPrevious 
}: { 
  state: StateDefinition; 
  isCurrent: boolean; 
  isPrevious: boolean;
}) {
  const position = STATE_POSITIONS[state.id];
  const categoryStyle = CATEGORY_STYLES[state.category];
  
  if (!position) return null;
  
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {/* Glow effect for current state */}
      {isCurrent && (
        <rect
          x={-4}
          y={-4}
          width={NODE_WIDTH + 8}
          height={NODE_HEIGHT + 8}
          rx={10}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={3}
          className="animate-pulse"
          opacity={0.6}
        />
      )}
      
      {/* Node background */}
      <rect
        x={0}
        y={0}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        fill={isCurrent ? '#fbbf24' : isPrevious ? '#94a3b8' : categoryStyle.color}
        fillOpacity={isCurrent ? 0.3 : isPrevious ? 0.3 : 0.2}
        stroke={isCurrent ? '#fbbf24' : isPrevious ? '#94a3b8' : categoryStyle.color}
        strokeWidth={isCurrent ? 2 : 1}
      />
      
      {/* State label */}
      <text
        x={NODE_WIDTH / 2}
        y={NODE_HEIGHT / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isCurrent ? '#fbbf24' : '#e5e7eb'}
        fontSize={11}
        fontWeight={isCurrent ? 600 : 400}
        className="select-none"
      >
        {state.label}
      </text>
      
      {/* Current state indicator */}
      {isCurrent && (
        <circle
          cx={NODE_WIDTH - 8}
          cy={8}
          r={5}
          fill="#fbbf24"
          className="animate-pulse"
        />
      )}
      
      {/* Previous state indicator */}
      {isPrevious && !isCurrent && (
        <circle
          cx={NODE_WIDTH - 8}
          cy={8}
          r={4}
          fill="#94a3b8"
        />
      )}
      
      {/* Tooltip trigger area */}
      <title>{state.description}</title>
    </g>
  );
}

/**
 * Renders transition arrows between states
 */
function TransitionArrows({ states, currentState }: { states: StateDefinition[]; currentState: string | null }) {
  const arrows: ReactElement[] = [];
  
  states.forEach(state => {
    state.validTransitions.forEach(targetId => {
      const points = getArrowPoints(state.id, targetId);
      if (!points) return;
      
      const isActive = state.id === currentState;
      const key = `${state.id}-${targetId}`;
      
      arrows.push(
        <g key={key}>
          {/* Arrow line */}
          <line
            x1={points.x1}
            y1={points.y1}
            x2={points.x2}
            y2={points.y2}
            stroke={isActive ? '#fbbf24' : '#4b5563'}
            strokeWidth={isActive ? 2 : 1}
            strokeOpacity={isActive ? 0.8 : 0.3}
            markerEnd={`url(#arrowhead${isActive ? '-active' : ''})`}
          />
        </g>
      );
    });
  });
  
  return <>{arrows}</>;
}

/**
 * Renders the legend
 */
function Legend() {
  return (
    <div className="flex flex-wrap gap-4 mt-4 px-2">
      {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
        <div key={key} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded"
            style={{ backgroundColor: style.color, opacity: 0.6 }}
          />
          <span className="text-xs text-gray-400">{style.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-yellow-400" />
        <span className="text-xs text-gray-400">Current State</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-gray-400" />
        <span className="text-xs text-gray-400">Previous State</span>
      </div>
    </div>
  );
}

/**
 * StateFlowDiagram component — visualizes the workflow state machine.
 */
export function StateFlowDiagram({ currentState, previousState }: StateFlowDiagramProps) {
  const svgWidth = 800;
  const svgHeight = 450;
  
  // Memoize state lookup for performance
  const stateMap = useMemo(() => {
    return STATES.reduce((acc, state) => {
      acc[state.id] = state;
      return acc;
    }, {} as Record<string, StateDefinition>);
  }, []);
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Header */}
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span>🔄</span> Workflow State Machine
        {currentState && (
          <span className="ml-auto text-sm font-normal text-yellow-400">
            Current: {currentState.replace(/_/g, ' ')}
          </span>
        )}
      </h3>
      
      {/* SVG Diagram */}
      <div className="overflow-x-auto">
        <svg 
          width={svgWidth} 
          height={svgHeight} 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="min-w-[800px]"
        >
          {/* Defs for arrow markers */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth={10}
              markerHeight={7}
              refX={9}
              refY={3.5}
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#4b5563"
                fillOpacity={0.5}
              />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth={10}
              markerHeight={7}
              refX={9}
              refY={3.5}
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#fbbf24"
                fillOpacity={0.8}
              />
            </marker>
          </defs>
          
          {/* Category labels */}
          <text x={50} y={25} fill="#6b7280" fontSize={10} fontWeight={500}>
            ONBOARDING
          </text>
          <text x={300} y={25} fill="#6b7280" fontSize={10} fontWeight={500}>
            MAIN FLOW
          </text>
          <text x={50} y={325} fill="#6b7280" fontSize={10} fontWeight={500}>
            WEEKLY GOAL FLOW
          </text>
          <text x={650} y={125} fill="#6b7280" fontSize={10} fontWeight={500}>
            OVERLAY
          </text>
          
          {/* Transition arrows (rendered first, behind nodes) */}
          <TransitionArrows states={STATES} currentState={currentState} />
          
          {/* State nodes */}
          {STATES.map(state => (
            <StateNode
              key={state.id}
              state={state}
              isCurrent={state.id === currentState}
              isPrevious={state.id === previousState}
            />
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <Legend />
      
      {/* State description when current state is set */}
      {currentState && stateMap[currentState] && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>{stateMap[currentState].label}:</strong>{' '}
            {stateMap[currentState].description}
          </p>
          {stateMap[currentState].validTransitions.length > 0 && (
            <p className="text-yellow-300/70 text-xs mt-1">
              Can transition to:{' '}
              {stateMap[currentState].validTransitions
                .map(t => stateMap[t]?.label || t)
                .join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default StateFlowDiagram;
