'use client';

/**
 * Children Management Page — Screen P3
 *
 * List view for managing children with:
 * - Display of all children with edit/archive actions
 * - Add Child button (disabled at 8 children)
 * - Inline add/edit forms
 * - Archive confirmation dialog
 *
 * @see Requirements 14.1-14.5: Manage Children
 * @see design.md - Screen P3: Children Management
 */

import { useState } from 'react';
import Link from 'next/link';
import { useChildren } from '@/src/hooks/useChildren';
import { useProfile } from '@/src/hooks/useProfile';
import { useAddChild, useUpdateChild, useArchiveChild } from '@/src/hooks/useChildMutations';
import { SkeletonList } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import { EmptyState } from '@/src/components/common/EmptyState';
import type { ChildOverview, ChildMutationRequest, ChildGender } from '@/src/types/family';

const MAX_CHILDREN = 8;

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Gender options for the form.
 */
const GENDER_OPTIONS: { value: ChildGender | ''; label: string }[] = [
  { value: '', label: 'Prefer not to say' },
  { value: 'MALE', label: 'Boy' },
  { value: 'FEMALE', label: 'Girl' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * Validate birth date is 0-18 years in the past.
 */
function isValidBirthDate(dateStr: string): { valid: boolean; error?: string } {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (date > today) {
    return { valid: false, error: 'Birth date cannot be in the future' };
  }
  
  // Check if more than 18 years ago
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  if (date < eighteenYearsAgo) {
    return { valid: false, error: 'Child must be 18 years or younger' };
  }
  
  return { valid: true };
}

/**
 * Get max date for birth date input (today).
 */
function getMaxDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get min date for birth date input (18 years ago).
 */
function getMinDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
}

/**
 * Form field wrapper.
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
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Child form component for add/edit.
 */
function ChildForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialData?: ChildOverview;
  onSubmit: (data: ChildMutationRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [birthDate, setBirthDate] = useState(initialData?.birth_date ?? '');
  const [gender, setGender] = useState<ChildGender | ''>(
    (initialData as unknown as { gender?: ChildGender })?.gender ?? ''
  );
  const [interests, setInterests] = useState(initialData?.interests.join(', ') ?? '');
  const [challenges, setChallenges] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }
    
    if (!birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const dateValidation = isValidBirthDate(birthDate);
      if (!dateValidation.valid && dateValidation.error) {
        newErrors.birthDate = dateValidation.error;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    const data: ChildMutationRequest = {
      name: name.trim(),
      birth_date: birthDate,
      ...(gender && { gender }),
      ...(interests && {
        interests: interests.split(',').map((i) => i.trim()).filter(Boolean),
      }),
      ...(challenges && {
        challenges: challenges.split(',').map((c) => c.trim()).filter(Boolean),
      }),
    };
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Name" required error={errors.name}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Child's name"
          maxLength={50}
          className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </FormField>

      <FormField label="Birth Date" required error={errors.birthDate}>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          min={getMinDate()}
          max={getMaxDate()}
          className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </FormField>

      <FormField label="Gender">
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as ChildGender | '')}
          className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Interests">
        <input
          type="text"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="Drawing, Sports, Music (comma separated)"
          className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </FormField>

      <FormField label="Challenges">
        <input
          type="text"
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          placeholder="Bedtime routines, Sharing (comma separated)"
          className="w-full px-3 py-2 bg-[#0F172A] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </FormField>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={classNames(
            'flex-1 py-2 px-4 font-medium rounded-lg text-sm transition-colors',
            isSubmitting
              ? 'bg-teal-500/50 text-white/70 cursor-not-allowed'
              : 'bg-teal-500 text-white hover:bg-teal-600'
          )}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Child'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-2 px-4 font-medium rounded-lg text-sm bg-gray-600 text-white hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/**
 * Archive confirmation dialog.
 */
function ArchiveConfirmDialog({
  childName,
  onConfirm,
  onCancel,
  isArchiving,
}: {
  childName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isArchiving: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E293B] rounded-2xl p-6 max-w-sm w-full border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">Archive {childName}?</h3>
        <p className="text-gray-400 text-sm mb-6">
          This will remove {childName} from your active children. This action cannot be
          undone from the app.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isArchiving}
            className="flex-1 py-2 px-4 font-medium rounded-lg text-sm bg-gray-600 text-white hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isArchiving}
            className={classNames(
              'flex-1 py-2 px-4 font-medium rounded-lg text-sm transition-colors',
              isArchiving
                ? 'bg-red-500/50 text-white/70 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            )}
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Child card component.
 */
function ChildCard({
  child,
  onEdit,
  onArchive,
}: {
  child: ChildOverview;
  onEdit: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="bg-[#1E293B] rounded-xl border border-white/5 p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium">{child.name}</h3>
            {child.birthday_upcoming && (
              <span
                role="img"
                aria-label="Birthday coming up!"
                title="Birthday coming up!"
              >
                🎂
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">{child.computed_age}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-teal-400 text-sm hover:text-teal-300 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onArchive}
            className="text-gray-400 text-sm hover:text-red-400 transition-colors"
          >
            Archive
          </button>
        </div>
      </div>
      {child.interests.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {child.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="px-2 py-0.5 bg-[#0F172A] rounded-full text-xs text-gray-400"
            >
              {interest}
            </span>
          ))}
          {child.interests.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">
              +{child.interests.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChildrenManagementPage() {
  const { data: childrenData, isLoading, error, refetch } = useChildren();
  const { data: profileData } = useProfile();
  const addMutation = useAddChild();
  const updateMutation = useUpdateChild();
  const archiveMutation = useArchiveChild();

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildOverview | null>(null);
  const [archivingChild, setArchivingChild] = useState<ChildOverview | null>(null);

  const children = childrenData?.children ?? [];
  const fatherId = profileData?.father_id;
  const canAddChild = children.length < MAX_CHILDREN;

  // Handle add child
  const handleAddChild = async (data: ChildMutationRequest) => {
    if (!fatherId) return;
    try {
      await addMutation.mutateAsync({ fatherId, data });
      setShowAddForm(false);
    } catch {
      // Error handled by mutation state
    }
  };

  // Handle update child
  const handleUpdateChild = async (data: ChildMutationRequest) => {
    if (!fatherId || !editingChild) return;
    try {
      await updateMutation.mutateAsync({
        fatherId,
        childId: editingChild.child_id,
        data,
      });
      setEditingChild(null);
    } catch {
      // Error handled by mutation state
    }
  };

  // Handle archive child
  const handleArchiveChild = async () => {
    if (!fatherId || !archivingChild) return;
    try {
      await archiveMutation.mutateAsync({
        fatherId,
        childId: archivingChild.child_id,
      });
      setArchivingChild(null);
    } catch {
      // Error handled by mutation state
    }
  };

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
            <h1 className="text-xl font-semibold text-white">Manage Children</h1>
          </header>
          <SkeletonList count={3} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
            <h1 className="text-xl font-semibold text-white">Manage Children</h1>
          </header>
          <ErrorState
            type="error"
            title="Couldn't load children"
            description="Something went wrong while fetching your children."
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
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Manage Children</h1>
            <p className="text-gray-400 text-sm">
              {children.length} of {MAX_CHILDREN} children
            </p>
          </div>
        </header>

        {/* Error messages */}
        {(addMutation.error || updateMutation.error || archiveMutation.error) && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* Add Child Button or Form */}
        {showAddForm ? (
          <div className="bg-[#1E293B] rounded-xl border border-white/5 p-4 mb-4">
            <h3 className="text-white font-medium mb-3">Add Child</h3>
            <ChildForm
              onSubmit={handleAddChild}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={addMutation.isPending}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={!canAddChild}
            className={classNames(
              'w-full py-3 px-4 rounded-xl font-medium mb-4 transition-colors',
              canAddChild
                ? 'bg-teal-500 text-white hover:bg-teal-600'
                : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            )}
          >
            {canAddChild ? '+ Add Child' : `Maximum ${MAX_CHILDREN} children reached`}
          </button>
        )}

        {/* Children List */}
        {children.length === 0 ? (
          <EmptyState
            title="No children yet"
            description="Add your children to get personalized coaching tailored to each one."
            action={{
              label: 'Add Your First Child',
              onClick: () => setShowAddForm(true),
            }}
          />
        ) : (
          <div className="space-y-3">
            {children.map((child) =>
              editingChild?.child_id === child.child_id ? (
                <div
                  key={child.child_id}
                  className="bg-[#1E293B] rounded-xl border border-teal-500/30 p-4"
                >
                  <h3 className="text-white font-medium mb-3">Edit {child.name}</h3>
                  <ChildForm
                    initialData={child}
                    onSubmit={handleUpdateChild}
                    onCancel={() => setEditingChild(null)}
                    isSubmitting={updateMutation.isPending}
                  />
                </div>
              ) : (
                <ChildCard
                  key={child.child_id}
                  child={child}
                  onEdit={() => setEditingChild(child)}
                  onArchive={() => setArchivingChild(child)}
                />
              )
            )}
          </div>
        )}

        {/* Archive Confirmation Dialog */}
        {archivingChild && (
          <ArchiveConfirmDialog
            childName={archivingChild.name}
            onConfirm={handleArchiveChild}
            onCancel={() => setArchivingChild(null)}
            isArchiving={archiveMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
