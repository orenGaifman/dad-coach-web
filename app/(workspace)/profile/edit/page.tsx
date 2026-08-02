'use client';

/**
 * Edit Profile Page — Screen P2
 *
 * Form for editing basic profile information:
 * - Display name
 * - Timezone
 * - Email address
 *
 * Saves via Application API and shows inline confirmation.
 *
 * @see Requirement 13.2, 13.3, 13.4: Profile edit functionality
 * @see design.md - Screen P2: Edit Profile
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/src/hooks/useProfile';
import { useUpdateProfile } from '@/src/hooks/useUpdateProfile';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';

/**
 * Common timezone options.
 */
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Jerusalem', label: 'Israel (Asia/Jerusalem)' },
  { value: 'America/New_York', label: 'Eastern Time (America/New_York)' },
  { value: 'America/Chicago', label: 'Central Time (America/Chicago)' },
  { value: 'America/Denver', label: 'Mountain Time (America/Denver)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (America/Los_Angeles)' },
  { value: 'Europe/London', label: 'London (Europe/London)' },
  { value: 'Europe/Paris', label: 'Paris (Europe/Paris)' },
  { value: 'Europe/Berlin', label: 'Berlin (Europe/Berlin)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Asia/Tokyo)' },
  { value: 'Asia/Dubai', label: 'Dubai (Asia/Dubai)' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia/Sydney)' },
];

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Form field wrapper with label and error.
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

export default function EditProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, error, refetch } = useProfile();
  const mutation = useUpdateProfile();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setTimezone(profile.timezone);
      setEmail(profile.email ?? '');
    }
  }, [profile]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (displayName.length > 50) {
      newErrors.displayName = 'Name must be 50 characters or less';
    }

    if (!timezone) {
      newErrors.timezone = 'Timezone is required';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setShowSuccess(false);

    try {
      await mutation.mutateAsync({
        fatherId: profile!.father_id,
        data: {
          display_name: displayName.trim(),
          timezone,
          ...(email && { email: email.trim() }),
        },
      });
      setShowSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      // Error handled by mutation state
    }
  };

  // Check if form has changes
  const hasChanges =
    profile &&
    (displayName !== profile.display_name ||
      timezone !== profile.timezone ||
      email !== (profile.email ?? ''));

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4 flex items-center gap-3">
            <Link
              href="/profile"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Back to Profile</span>
              ←
            </Link>
            <h1 className="text-xl font-semibold text-white">Edit Profile</h1>
          </header>
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4 flex items-center gap-3">
            <Link
              href="/profile"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Back to Profile</span>
              ←
            </Link>
            <h1 className="text-xl font-semibold text-white">Edit Profile</h1>
          </header>
          <ErrorState
            type="error"
            title="Couldn't load your profile"
            description="Something went wrong while fetching your profile data."
            onRetry={refetch}
          />
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
            href="/profile"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
          >
            <span className="sr-only">Back to Profile</span>
            ←
          </Link>
          <h1 className="text-xl font-semibold text-white">Edit Profile</h1>
        </header>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <p className="text-emerald-400 text-sm">
              ✓ Profile updated successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {mutation.error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">
              Something went wrong while saving. Please try again.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-[#1E293B] rounded-2xl p-5 border border-white/5 space-y-5">
            {/* Display Name */}
            <FormField label="Display Name" required error={errors.displayName}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
                className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </FormField>

            {/* Timezone */}
            <FormField label="Timezone" required error={errors.timezone}>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select timezone</option>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
                {/* Include current timezone if not in list */}
                {!TIMEZONE_OPTIONS.some((tz) => tz.value === timezone) && timezone && (
                  <option value={timezone}>{timezone}</option>
                )}
              </select>
            </FormField>

            {/* Email */}
            <FormField label="Email" error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="text-gray-500 text-xs mt-1">
                Optional. Used for account recovery.
              </p>
            </FormField>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending || !hasChanges}
            className={classNames(
              'w-full py-3 px-4 font-medium rounded-xl transition-colors',
              mutation.isPending || !hasChanges
                ? 'bg-teal-500/50 text-white/70 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            )}
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Cancel Link */}
          <Link
            href="/profile"
            className="block text-center text-gray-400 hover:text-white transition-colors py-2"
          >
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
}
