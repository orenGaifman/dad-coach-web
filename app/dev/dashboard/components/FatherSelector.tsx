'use client';

/**
 * FatherSelector — searchable dropdown for selecting a father in the Dev Dashboard.
 *
 * Features:
 * - Searchable dropdown/input field for filtering fathers
 * - 300ms debounce on search input to avoid excessive API calls
 * - Filters by phone number or display_name
 * - Stores selected father ID in localStorage
 * - Auto-loads stored father ID on page load
 *
 * @see Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchFathers } from '@/src/api/dev';
import type { DevFatherListItem } from '@/src/types/dev';

/** localStorage key for persisting the selected father ID */
const LOCAL_STORAGE_KEY = 'dev-dashboard-selected-father';

/** Debounce delay in milliseconds for search input */
const DEBOUNCE_DELAY_MS = 300;

interface FatherSelectorProps {
  /** Callback when a father is selected */
  onSelect?: (father: DevFatherListItem | null) => void;
  /** Callback when father ID changes (includes initial load from localStorage) */
  onFatherIdChange?: (fatherId: number | null) => void;
}

/**
 * Custom hook for debouncing a value.
 * Returns the debounced value after the specified delay.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Loads the stored father ID from localStorage.
 * Returns null if no ID is stored or if localStorage is unavailable.
 */
function loadStoredFatherId(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  } catch {
    // localStorage may be unavailable (e.g., private browsing)
    return null;
  }
}

/**
 * Stores the father ID in localStorage.
 * Removes the key if fatherId is null.
 */
function storeFatherId(fatherId: number | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (fatherId === null) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, String(fatherId));
    }
  } catch {
    // localStorage may be unavailable (e.g., private browsing)
  }
}

export function FatherSelector({ onSelect, onFatherIdChange }: FatherSelectorProps) {
  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAY_MS);

  // Dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const [fathers, setFathers] = useState<DevFatherListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected father state
  const [selectedFather, setSelectedFather] = useState<DevFatherListItem | null>(null);
  const [storedFatherId, setStoredFatherId] = useState<number | null>(null);

  // Refs for click outside handling
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load stored father ID on mount
  useEffect(() => {
    const id = loadStoredFatherId();
    setStoredFatherId(id);
    if (id !== null) {
      onFatherIdChange?.(id);
    }
  }, [onFatherIdChange]);

  // Fetch fathers when debounced search changes or dropdown opens
  const fetchFathersData = useCallback(async (search: string, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFathers(search || undefined, 0, 20, signal);
      setFathers(response.items);

      // If we have a stored father ID and no selection yet, try to find and select it
      if (storedFatherId !== null && selectedFather === null) {
        const storedFatherInList = response.items.find((f) => f.id === storedFatherId);
        if (storedFatherInList) {
          setSelectedFather(storedFatherInList);
          onSelect?.(storedFatherInList);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      setError(err instanceof Error ? err.message : 'Failed to load fathers');
      setFathers([]);
    } finally {
      setIsLoading(false);
    }
  }, [storedFatherId, selectedFather, onSelect]);

  // Fetch when debounced search changes and dropdown is open
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();
    fetchFathersData(debouncedSearch, controller.signal);

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, isOpen, fetchFathersData]);

  // Auto-load stored father on initial mount (if stored ID exists)
  useEffect(() => {
    if (storedFatherId === null || selectedFather !== null) {
      return;
    }

    const controller = new AbortController();
    
    const loadStoredFather = async () => {
      setIsLoading(true);
      try {
        // Fetch with no search to get the stored father
        const response = await fetchFathers(undefined, 0, 100, controller.signal);
        const storedFatherInList = response.items.find((f) => f.id === storedFatherId);
        if (storedFatherInList) {
          setSelectedFather(storedFatherInList);
          onSelect?.(storedFatherInList);
        } else {
          // Father not found - clear the stored ID
          storeFatherId(null);
          setStoredFatherId(null);
          onFatherIdChange?.(null);
        }
        setFathers(response.items);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load fathers');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredFather();

    return () => {
      controller.abort();
    };
  }, [storedFatherId, selectedFather, onSelect, onFatherIdChange]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle father selection
  const handleSelect = useCallback(
    (father: DevFatherListItem) => {
      setSelectedFather(father);
      setIsOpen(false);
      setSearchQuery('');
      storeFatherId(father.id);
      setStoredFatherId(father.id);
      onSelect?.(father);
      onFatherIdChange?.(father.id);
    },
    [onSelect, onFatherIdChange]
  );

  // Handle clearing selection
  const handleClear = useCallback(() => {
    setSelectedFather(null);
    storeFatherId(null);
    setStoredFatherId(null);
    onSelect?.(null);
    onFatherIdChange?.(null);
    setSearchQuery('');
    inputRef.current?.focus();
  }, [onSelect, onFatherIdChange]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      } else if (event.key === 'ArrowDown' && !isOpen) {
        setIsOpen(true);
      }
    },
    [isOpen]
  );

  // Format display text for a father
  const formatFatherDisplay = (father: DevFatherListItem) => {
    const name = father.display_name || 'Unknown';
    return `${name} (${father.phone})`;
  };

  // Format state badge
  const formatStateBadge = (state: string | null) => {
    if (!state) return null;
    
    const stateColors: Record<string, string> = {
      WELCOME: 'bg-blue-500/20 text-blue-300',
      WAITING: 'bg-gray-500/20 text-gray-300',
      SCHEDULE_QUALITY_TIME: 'bg-purple-500/20 text-purple-300',
      QUALITY_TIME_FOLLOW_UP: 'bg-green-500/20 text-green-300',
    };
    
    const colorClass = stateColors[state] || 'bg-gray-500/20 text-gray-300';
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
        {state}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor="father-selector-input"
        className="block text-sm text-gray-400 mb-1"
      >
        Select Father
      </label>

      {/* Selected Father Display / Search Input */}
      <div className="relative">
        {selectedFather && !isOpen ? (
          // Show selected father with clear button
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <div className="flex-1 min-w-0">
              <div className="text-white truncate">
                {formatFatherDisplay(selectedFather)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {formatStateBadge(selectedFather.current_workflow_state)}
                <span className="text-xs text-gray-500">
                  {selectedFather.current_belt}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear selection"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Change selection"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        ) : (
          // Show search input
          <div className="relative">
            <input
              ref={inputRef}
              id="father-selector-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or phone..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <svg
                  className="w-5 h-5 text-gray-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1E293B] border border-white/10 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {error ? (
            <div className="p-3 text-red-400 text-sm">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          ) : fathers.length === 0 && !isLoading ? (
            <div className="p-3 text-gray-400 text-sm text-center">
              {debouncedSearch ? 'No fathers found' : 'Type to search...'}
            </div>
          ) : (
            <ul role="listbox" aria-label="Father options">
              {fathers.map((father) => (
                <li
                  key={father.id}
                  role="option"
                  aria-selected={selectedFather?.id === father.id}
                  onClick={() => handleSelect(father)}
                  className={`px-3 py-2 cursor-pointer transition-colors hover:bg-white/10 ${
                    selectedFather?.id === father.id ? 'bg-blue-500/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-white truncate">
                        {father.display_name || 'Unknown'}
                      </div>
                      <div className="text-gray-400 text-sm truncate">
                        {father.phone}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {formatStateBadge(father.current_workflow_state)}
                      <span className="text-xs text-gray-500">
                        {father.current_belt}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default FatherSelector;
