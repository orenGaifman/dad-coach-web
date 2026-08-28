'use client';

/**
 * Activity Log Page — Screens C3/C4
 *
 * Allows fathers to log two types of activities:
 * 1. Quality Time - time spent with a child (12 points)
 * 2. Positive Activity - positive parenting moments (5 points)
 *
 * Features:
 * - Type selector to choose activity type
 * - Form validation with inline errors
 * - Date constraints (not future, not >7 days past)
 * - Duration constraints for quality time (15-480 mins)
 * - Child selector (required for quality time, optional for positive)
 * - Activity type selector for positive activities
 * - Confirmation view with points and streak impact
 * - Rate limit and duplicate error handling
 *
 * Requirements: 10.1-10.7, 11.1-11.6 (Activity Logging)
 * @see design.md - Screen C3: Log Activity, Screen C4: Activity Confirmation
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChildren } from '@/src/hooks/useChildren';
import {
  useLogQualityTime,
  useLogPositiveActivity,
  getActivityErrorMessage,
} from '@/src/hooks/useLogActivity';
import type {
  LogQualityTimeRequest,
  LogPositiveActivityRequest,
  PositiveActivityType,
  ActivityResponse,
} from '@/src/types/coaching';
import { classNames } from '@/src/utils/classNames';

/**
 * Activity type options for the selector.
 */
type ActivityLogType = 'QUALITY_TIME' | 'POSITIVE_ACTIVITY';


/**
 * Positive activity type options.
 */
const POSITIVE_ACTIVITY_TYPES: { value: PositiveActivityType; label: string; icon: string }[] = [
  { value: 'PRAISE', label: 'Praise', icon: '👏' },
  { value: 'SHARED_ACTIVITY', label: 'Shared Activity', icon: '🎮' },
  { value: 'TEACHING_MOMENT', label: 'Teaching Moment', icon: '📚' },
  { value: 'QUALITY_CONVERSATION', label: 'Quality Conversation', icon: '💬' },
  { value: 'OTHER', label: 'Other', icon: '✨' },
];

/**
 * Get today's date in YYYY-MM-DD format.
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date 7 days ago in YYYY-MM-DD format.
 */
function getMinDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

/**
 * Validate date is not in the future and not more than 7 days ago.
 */
function isValidDate(dateStr: string): { valid: boolean; error?: string } {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 7);
  minDate.setHours(0, 0, 0, 0);
  
  if (date > today) {
    return { valid: false, error: 'Date cannot be in the future' };
  }
  if (date < minDate) {
    return { valid: false, error: 'Date cannot be more than 7 days ago' };
  }
  return { valid: true };
}

/**
 * Validate duration is within range.
 */
function isValidDuration(duration: number): { valid: boolean; error?: string } {
  if (duration < 15) {
    return { valid: false, error: 'Duration must be at least 15 minutes' };
  }
  if (duration > 480) {
    return { valid: false, error: 'Duration cannot exceed 8 hours (480 minutes)' };
  }
  return { valid: true };
}


/**
 * Activity type selector component.
 */
function ActivityTypeSelector({
  selected,
  onChange,
}: {
  selected: ActivityLogType;
  onChange: (type: ActivityLogType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <button
        type="button"
        onClick={() => onChange('QUALITY_TIME')}
        className={classNames(
          'flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors',
          selected === 'QUALITY_TIME'
            ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
            : 'bg-[#1E293B] border-white/5 text-gray-400 hover:bg-[#2D3B4D]'
        )}
      >
        <span className="text-2xl">⏰</span>
        <span className="text-sm font-medium">Quality Time</span>
        <span className="text-xs opacity-70">12 points</span>
      </button>
      
      <button
        type="button"
        onClick={() => onChange('POSITIVE_ACTIVITY')}
        className={classNames(
          'flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors',
          selected === 'POSITIVE_ACTIVITY'
            ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
            : 'bg-[#1E293B] border-white/5 text-gray-400 hover:bg-[#2D3B4D]'
        )}
      >
        <span className="text-2xl">💜</span>
        <span className="text-sm font-medium">Positive Activity</span>
        <span className="text-xs opacity-70">5 points</span>
      </button>
    </div>
  );
}

/**
 * Form input wrapper with label and error.
 */
function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}


/**
 * Confirmation view shown after successful activity log.
 */
function ConfirmationView({
  response,
  onDone,
}: {
  response: ActivityResponse;
  onDone: () => void;
}) {
  return (
    <div className="text-center py-8">
      {/* Success icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
        <span className="text-4xl">🎉</span>
      </div>
      
      {/* Points awarded */}
      <h2 className="text-2xl font-bold text-white mb-2">
        +{response.points_awarded} Points!
      </h2>
      
      {/* Encouragement message */}
      <p className="text-gray-400 mb-6">
        {response.encouragement_message}
      </p>
      
      {/* Streak info */}
      <div className="bg-[#1E293B] rounded-xl p-4 mb-6 border border-white/5">
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <span>🔥</span>
          <span className="font-semibold">
            {response.streak_impact.current_streak_days} Day Streak
          </span>
        </div>
        {response.streak_impact.streak_extended && (
          <p className="text-gray-500 text-sm mt-1">Streak extended!</p>
        )}
        {response.streak_impact.new_streak_started && (
          <p className="text-emerald-400 text-sm mt-1">New streak started!</p>
        )}
      </div>
      
      {/* Total score */}
      <p className="text-gray-500 text-sm mb-8">
        Total Score: {(response.updated_total_score ?? 0).toLocaleString()} XP
      </p>
      
      {/* Done button */}
      <button
        type="button"
        onClick={onDone}
        className="w-full py-3 px-4 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors"
      >
        Done
      </button>
    </div>
  );
}


/**
 * Quality Time form component.
 */
function QualityTimeForm({
  onSuccess,
}: {
  onSuccess: (response: ActivityResponse) => void;
}) {
  const { data: childrenData, isLoading: loadingChildren } = useChildren();
  const mutation = useLogQualityTime();
  
  const [childId, setChildId] = useState<number | ''>('');
  const [duration, setDuration] = useState<string>('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState(getTodayDate());
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const children = childrenData?.children ?? [];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (!childId) {
      newErrors.childId = 'Please select a child';
    }
    
    if (duration) {
      const durationNum = parseInt(duration, 10);
      const durationValidation = isValidDuration(durationNum);
      if (!durationValidation.valid && durationValidation.error) {
        newErrors.duration = durationValidation.error;
      }
    }
    
    if (description && description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }
    
    const dateValidation = isValidDate(activityDate);
    if (!dateValidation.valid && dateValidation.error) {
      newErrors.activityDate = dateValidation.error;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    const request: LogQualityTimeRequest = {
      child_id: childId as number,
      ...(duration && { duration_minutes: parseInt(duration, 10) }),
      ...(description && { description }),
      activity_date: activityDate,
    };
    
    try {
      const response = await mutation.mutateAsync(request);
      onSuccess(response);
    } catch {
      // Error handled by mutation state
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Child selector */}
      <FormField label="Child" required error={errors.childId}>
        <select
          value={childId}
          onChange={(e) => setChildId(e.target.value ? parseInt(e.target.value, 10) : '')}
          disabled={loadingChildren}
          className="w-full px-4 py-3 bg-[#1E293B] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">Select a child</option>
          {children.map((child) => (
            <option key={child.child_id} value={child.child_id}>
              {child.name}
            </option>
          ))}
        </select>
      </FormField>
      
      {/* Duration */}
      <FormField label="Duration (minutes)" error={errors.duration}>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g., 30"
          min={15}
          max={480}
          className="w-full px-4 py-3 bg-[#1E293B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <p className="text-gray-500 text-xs mt-1">Optional. 15-480 minutes.</p>
      </FormField>
      
      {/* Description */}
      <FormField label="Description" error={errors.description}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you do together?"
          maxLength={200}
          rows={3}
          className="w-full px-4 py-3 bg-[#1E293B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />
        <p className="text-gray-500 text-xs mt-1 text-right">
          {description.length}/200
        </p>
      </FormField>
      
      {/* Date */}
      <FormField label="Date" error={errors.activityDate}>
        <input
          type="date"
          value={activityDate}
          onChange={(e) => setActivityDate(e.target.value)}
          min={getMinDate()}
          max={getTodayDate()}
          className="w-full px-4 py-3 bg-[#1E293B] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </FormField>
      
      {/* Error message */}
      {mutation.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">
            {getActivityErrorMessage(mutation.error)}
          </p>
        </div>
      )}
      
      {/* Submit button */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className={classNames(
          'w-full py-3 px-4 font-medium rounded-xl transition-colors',
          mutation.isPending
            ? 'bg-teal-500/50 text-white/70 cursor-not-allowed'
            : 'bg-teal-500 text-white hover:bg-teal-600'
        )}
      >
        {mutation.isPending ? 'Logging...' : 'Log Quality Time'}
      </button>
    </form>
  );
}


/**
 * Positive Activity form component.
 */
function PositiveActivityForm({
  onSuccess,
}: {
  onSuccess: (response: ActivityResponse) => void;
}) {
  const { data: childrenData, isLoading: loadingChildren } = useChildren();
  const mutation = useLogPositiveActivity();
  
  const [activityType, setActivityType] = useState<PositiveActivityType | ''>('');
  const [childId, setChildId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState(getTodayDate());
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const children = childrenData?.children ?? [];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (!activityType) {
      newErrors.activityType = 'Please select an activity type';
    }
    
    if (description && description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }
    
    const dateValidation = isValidDate(activityDate);
    if (!dateValidation.valid && dateValidation.error) {
      newErrors.activityDate = dateValidation.error;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    const request: LogPositiveActivityRequest = {
      activity_type: activityType as PositiveActivityType,
      ...(childId && { child_id: childId as number }),
      ...(description && { description }),
      activity_date: activityDate,
    };
    
    try {
      const response = await mutation.mutateAsync(request);
      onSuccess(response);
    } catch {
      // Error handled by mutation state
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Activity type selector */}
      <FormField label="Activity Type" required error={errors.activityType}>
        <div className="grid grid-cols-2 gap-2">
          {POSITIVE_ACTIVITY_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setActivityType(type.value)}
              className={classNames(
                'flex items-center gap-2 p-3 rounded-xl border transition-colors text-left',
                activityType === type.value
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
                  : 'bg-[#1E293B] border-white/5 text-gray-400 hover:bg-[#2D3B4D]'
              )}
            >
              <span>{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </FormField>
      
      {/* Child selector (optional) */}
      <FormField label="Child (optional)">
        <select
          value={childId}
          onChange={(e) => setChildId(e.target.value ? parseInt(e.target.value, 10) : '')}
          disabled={loadingChildren}
          className="w-full px-4 py-3 bg-[#1E293B] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">No specific child</option>
          {children.map((child) => (
            <option key={child.child_id} value={child.child_id}>
              {child.name}
            </option>
          ))}
        </select>
      </FormField>
      
      {/* Description */}
      <FormField label="Description" error={errors.description}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened?"
          maxLength={200}
          rows={3}
          className="w-full px-4 py-3 bg-[#1E293B] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />
        <p className="text-gray-500 text-xs mt-1 text-right">
          {description.length}/200
        </p>
      </FormField>
      
      {/* Date */}
      <FormField label="Date" error={errors.activityDate}>
        <input
          type="date"
          value={activityDate}
          onChange={(e) => setActivityDate(e.target.value)}
          min={getMinDate()}
          max={getTodayDate()}
          className="w-full px-4 py-3 bg-[#1E293B] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </FormField>
      
      {/* Error message */}
      {mutation.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">
            {getActivityErrorMessage(mutation.error)}
          </p>
        </div>
      )}
      
      {/* Submit button */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className={classNames(
          'w-full py-3 px-4 font-medium rounded-xl transition-colors',
          mutation.isPending
            ? 'bg-teal-500/50 text-white/70 cursor-not-allowed'
            : 'bg-teal-500 text-white hover:bg-teal-600'
        )}
      >
        {mutation.isPending ? 'Logging...' : 'Log Positive Activity'}
      </button>
    </form>
  );
}


/**
 * Activity Log Page — Main component
 *
 * Renders the activity logging UI with type selector and appropriate form.
 * Shows confirmation view after successful submission.
 */
export default function LogActivityPage() {
  const router = useRouter();
  const [activityType, setActivityType] = useState<ActivityLogType>('QUALITY_TIME');
  const [response, setResponse] = useState<ActivityResponse | null>(null);
  
  // Handle successful activity log
  const handleSuccess = (activityResponse: ActivityResponse) => {
    setResponse(activityResponse);
  };
  
  // Handle done button - return to coaching page
  const handleDone = () => {
    router.push('/coaching');
  };
  
  // Show confirmation if we have a response
  if (response) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          {/* Header */}
          <header className="py-4 flex items-center gap-3">
            <Link
              href="/coaching"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Back to Coaching</span>
              ←
            </Link>
            <h1 className="text-xl font-semibold text-white">Activity Logged!</h1>
          </header>
          
          {/* Confirmation View */}
          <ConfirmationView response={response} onDone={handleDone} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="max-w-[512px] mx-auto px-4">
        {/* Header */}
        <header className="py-4 flex items-center gap-3">
          <Link
            href="/coaching"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
          >
            <span className="sr-only">Back to Coaching</span>
            ←
          </Link>
          <h1 className="text-xl font-semibold text-white">Log Activity</h1>
        </header>
        
        {/* Activity type selector */}
        <ActivityTypeSelector selected={activityType} onChange={setActivityType} />
        
        {/* Form based on selected type */}
        <div className="bg-[#1E293B] rounded-2xl p-5 border border-white/5">
          {activityType === 'QUALITY_TIME' ? (
            <QualityTimeForm onSuccess={handleSuccess} />
          ) : (
            <PositiveActivityForm onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}
