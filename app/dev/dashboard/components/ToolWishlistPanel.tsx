'use client';

/**
 * ToolWishlistPanel — displays AI-suggested tools that don't exist yet.
 * 
 * This allows developers to review what capabilities users are asking for
 * and make data-driven decisions about which tools to implement.
 * 
 * Features:
 * - Collapsible/expandable panel
 * - Shows tool wishes ordered by occurrence count (most requested first)
 * - Color-coded status badges
 * - Filter by status
 * - Displays user need and suggested capability
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchToolWishlist } from '@/src/api/dev';
import type { DevToolWishlist } from '@/src/types/dev';

/** Status colors mapping */
const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  REVIEWING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-300 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30',
  IMPLEMENTED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  DUPLICATE: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

/** Status icons */
const STATUS_ICONS: Record<string, string> = {
  NEW: '🆕',
  REVIEWING: '🔍',
  APPROVED: '✅',
  REJECTED: '❌',
  IMPLEMENTED: '🚀',
  DUPLICATE: '🔁',
};

/**
 * Renders a status badge.
 */
function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  const icon = STATUS_ICONS[status] || '❓';

  return (
    <span className={`text-xs px-2 py-0.5 rounded border inline-flex items-center gap-1 ${colorClass}`}>
      <span>{icon}</span>
      {status}
    </span>
  );
}

/**
 * Renders occurrence count badge.
 */
function OccurrenceBadge({ count }: { count: number }) {
  const colorClass = count >= 5 
    ? 'bg-red-500/20 text-red-300' 
    : count >= 3 
    ? 'bg-yellow-500/20 text-yellow-300' 
    : 'bg-gray-500/20 text-gray-300';

  return (
    <span className={`text-xs px-2 py-0.5 rounded font-mono ${colorClass}`}>
      ×{count}
    </span>
  );
}

/**
 * Formats a timestamp to a relative time string.
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Renders a single wishlist row.
 */
function WishlistRow({ wish }: { wish: DevToolWishlist }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-2 hover:bg-white/5 transition-colors text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-sm text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded font-mono truncate">
                {wish.suggested_name}
              </code>
              <OccurrenceBadge count={wish.occurrence_count} />
            </div>
            <p className="text-gray-400 text-xs truncate">
              {wish.user_need}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={wish.status} />
            <span
              className={`text-gray-400 transition-transform duration-200 text-xs ${
                isExpanded ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-2 pb-3 space-y-2">
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <div>
              <span className="text-gray-500 text-xs font-medium">User Need:</span>
              <p className="text-gray-300 text-sm mt-0.5">{wish.user_need}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs font-medium">Suggested Capability:</span>
              <p className="text-gray-300 text-sm mt-0.5">{wish.suggested_capability}</p>
            </div>
            {wish.original_message && (
              <div>
                <span className="text-gray-500 text-xs font-medium">Original Message:</span>
                <p className="text-gray-400 text-xs mt-0.5 italic">"{wish.original_message}"</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
              <span>Created: {formatRelativeTime(wish.created_at)}</span>
              {wish.father_id && <span>Father ID: {wish.father_id}</span>}
              {wish.priority && <span>Priority: {wish.priority}/5</span>}
            </div>
            {wish.review_notes && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-gray-500 text-xs font-medium">Review Notes:</span>
                <p className="text-gray-400 text-xs mt-0.5">{wish.review_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ToolWishlistPanel component — displays AI-suggested tools.
 */
export function ToolWishlistPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [wishes, setWishes] = useState<DevToolWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchToolWishlist(statusFilter || undefined, 100);
      setWishes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // Fetch when expanded or filter changes
  useEffect(() => {
    if (isExpanded) {
      fetchWishlist();
    }
  }, [isExpanded, fetchWishlist]);

  // Summary stats
  const newCount = wishes.filter(w => w.status === 'NEW').length;
  const totalOccurrences = wishes.reduce((sum, w) => sum + w.occurrence_count, 0);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Header with collapse toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isExpanded}
        aria-controls="tool-wishlist-content"
      >
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>💡</span> AI Tool Wishlist
        </h3>
        <div className="flex items-center gap-2">
          {!isExpanded && wishes.length > 0 && (
            <span className="text-xs text-gray-500">
              {newCount} new, {totalOccurrences} total requests
            </span>
          )}
          <span
            className={`text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Collapsed summary */}
      {!isExpanded && (
        <p className="text-gray-500 text-xs mt-2">
          Click to view AI-suggested tools that users are asking for
        </p>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div id="tool-wishlist-content" className="mt-4">
          {/* Filter controls */}
          <div className="flex items-center gap-2 mb-3">
            <label htmlFor="status-filter" className="text-gray-400 text-xs">Filter:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="IMPLEMENTED">Implemented</option>
              <option value="DUPLICATE">Duplicate</option>
            </select>
            <button
              onClick={fetchWishlist}
              disabled={isLoading}
              className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500"
              aria-label="Refresh wishlist"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && wishes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-sm">No tool wishes found</p>
              <p className="text-xs mt-1">The AI is happy with its current toolset!</p>
            </div>
          )}

          {/* Wishlist */}
          {!isLoading && !error && wishes.length > 0 && (
            <>
              <div className="max-h-96 overflow-y-auto">
                {wishes.map((wish) => (
                  <WishlistRow key={wish.id} wish={wish} />
                ))}
              </div>

              {/* Summary footer */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-gray-500 text-xs">
                  {wishes.length} wishes · {totalOccurrences} total occurrences
                </span>
                <div className="flex gap-2">
                  {Object.entries(STATUS_ICONS).slice(0, 4).map(([status, icon]) => {
                    const count = wishes.filter(w => w.status === status).length;
                    if (count === 0) return null;
                    return (
                      <span key={status} className="text-xs text-gray-500">
                        {icon} {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ToolWishlistPanel;
