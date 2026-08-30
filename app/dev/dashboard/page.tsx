'use client';

import { useState, useCallback } from 'react';
import { FatherSelector } from './components/FatherSelector';
import { FatherStatePanel } from './components/FatherStatePanel';
import { UnifiedConversationTimeline } from './components/UnifiedConversationTimeline';
import { AutoRefreshToggle } from './components/AutoRefreshToggle';
import { TimezoneIndicator } from './components/TimezoneIndicator';
import { StatusDictionaryPanel } from './components/StatusDictionaryPanel';
import { StateFlowDiagram } from './components/StateFlowDiagram';
import { ToolWishlistPanel } from './components/ToolWishlistPanel';
import type { DevFatherListItem } from '@/src/types/dev';

/**
 * Dev Dashboard — main page for debugging WhatsApp workflow conversations.
 * 
 * This page provides developers and QA engineers with real-time visibility into:
 * - Father state details (workflow state, belt, children, quality times)
 * - Message history (inbound/outbound WhatsApp messages)
 * - State transition logs (workflow state machine history)
 * 
 * Layout:
 * - Header: Father selector (left), auto-refresh toggle (center), timezone indicator (right)
 * - Main content: Two-column responsive grid (40% left / 60% right on desktop)
 *   - Left column: Father state panel
 *   - Right column: Message log, transition timeline
 * 
 * Component Integration:
 * - FatherSelector: calls onSelect(fatherId) when a father is selected, persists to localStorage
 * - FatherStatePanel: accepts fatherId prop, has internal loading/error states
 * - MessageLogPanel: accepts fatherId and autoRefreshEnabled props, has internal loading/error states
 * - TransitionTimeline: accepts fatherId and autoRefreshEnabled props, has internal loading/error states
 * - AutoRefreshToggle: controlled component with enabled/onToggle props
 * - TimezoneIndicator: shows timezone indicator with error handling
 * 
 * Requirements covered:
 * - Requirement 6.3: WHEN a father is selected, load and display that father's state, messages, and transitions
 * - Requirement 7.7: WHEN only some dashboard components load successfully, display partial data with error indicators
 *   (Each panel handles its own loading, error, and empty states internally)
 * - Requirement 11.4: Auto-refresh defaults to enabled on every page load
 * - Design.md: Page layout with 40%/60% responsive grid
 */

/**
 * Placeholder for the Quality Time Panel component.
 * Will be implemented in a subsequent task.
 */
function QualityTimePanelPlaceholder() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span>⏰</span> Scheduled Quality Times
      </h3>
      <div className="space-y-2">
        <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

/** Workflow state for the state flow diagram */
interface WorkflowStateInfo {
  currentState: string | null;
  previousState: string | null;
}


export default function DevDashboardPage() {
  // Auto-refresh state - defaults to enabled on every page load (per requirement 11.4)
  // This state is shared between MessageLogPanel and TransitionTimeline
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Selected father state for child components
  const [selectedFather, setSelectedFather] = useState<DevFatherListItem | null>(null);
  const [selectedFatherId, setSelectedFatherId] = useState<number | null>(null);

  // Workflow state for state flow diagram
  const [workflowState, setWorkflowState] = useState<WorkflowStateInfo>({
    currentState: null,
    previousState: null,
  });

  // Handle auto-refresh toggle
  // @see Requirements 11.1, 11.3
  const handleAutoRefreshToggle = useCallback((enabled: boolean) => {
    setAutoRefreshEnabled(enabled);
  }, []);

  // Handle father selection
  const handleFatherSelect = useCallback((father: DevFatherListItem | null) => {
    setSelectedFather(father);
    // Reset workflow state when father changes
    if (!father) {
      setWorkflowState({ currentState: null, previousState: null });
    }
  }, []);

  // Handle father ID change (includes initial load from localStorage)
  const handleFatherIdChange = useCallback((fatherId: number | null) => {
    setSelectedFatherId(fatherId);
  }, []);

  // Handle workflow state changes from FatherStatePanel
  const handleWorkflowStateChange = useCallback((currentState: string | null, previousState: string | null) => {
    setWorkflowState({ currentState, previousState });
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6">
      {/* Header Row */}
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🛠️</span> Dev Dashboard
          </h1>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-[250px] lg:min-w-[300px]">
              <FatherSelector 
                onSelect={handleFatherSelect}
                onFatherIdChange={handleFatherIdChange}
              />
            </div>
            <div className="flex items-center gap-4">
              <AutoRefreshToggle 
                enabled={autoRefreshEnabled} 
                onToggle={handleAutoRefreshToggle} 
              />
              <TimezoneIndicator />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto">
        {selectedFather ? (
          <div className="space-y-6">
            {/* State Flow Diagram - Full Width */}
            <StateFlowDiagram
              currentState={workflowState.currentState}
              previousState={workflowState.previousState}
            />
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
              {/* Left Column (40%) - Father State, Children, Quality Times */}
              <div className="space-y-4">
                <FatherStatePanel 
                  fatherId={selectedFather.id}
                  onWorkflowStateChange={handleWorkflowStateChange}
                />
                <QualityTimePanelPlaceholder />
                <ToolWishlistPanel />
                <StatusDictionaryPanel />
              </div>

              {/* Right Column (60%) - Unified Conversation Timeline */}
              <div className="space-y-4">
                <UnifiedConversationTimeline 
                  fatherId={selectedFather.id} 
                  autoRefreshEnabled={autoRefreshEnabled}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No Father Selected
            </h2>
            <p className="text-gray-400 max-w-md">
              Select a father from the dropdown above to view their workflow state, 
              messages, and state transitions.
            </p>
          </div>
        )}
      </main>

      {/* Footer with helpful info */}
      <footer className="max-w-7xl mx-auto mt-8 pt-4 border-t border-white/10">
        <p className="text-gray-500 text-xs text-center">
          Dev Dashboard v1.0 — Select a father to view their workflow state, messages, and transitions
          {selectedFatherId && (
            <span className="ml-2 text-gray-600">
              (Selected ID: {selectedFatherId})
            </span>
          )}
        </p>
      </footer>
    </div>
  );
}
