'use client';

import { useState, useCallback, forwardRef } from 'react';
import Image from 'next/image';

import { VALIDATION } from '@/src/constants/onboarding';
import type { ChildData, ChildGender } from '@/src/types/onboarding';
import { ChildCard } from './ChildCard';

// ---------------------------------------------------------------------------
// Internal Types
// ---------------------------------------------------------------------------

interface ChildFormData {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: ChildGender | '';
  interests: string[];
  challenges: string[];
}

/** Per-child validation errors: childId → fieldName → error message */
type ChildErrors = Record<string, Record<string, string>>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ChildrenFormProps {
  onSubmit: (children: ChildData[]) => void;
  initialData?: ChildData[];
  isSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `child-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toChildFormData(child: ChildData): ChildFormData {
  return {
    id: generateId(),
    name: child.name,
    birthDate: child.birth_date,
    gender: child.gender ?? '',
    interests: child.interests ?? [],
    challenges: child.challenges ?? [],
  };
}

function toChildData(form: ChildFormData): ChildData {
  const child: ChildData = {
    name: form.name,
    birth_date: form.birthDate,
  };
  if (form.gender) {
    child.gender = form.gender;
  }
  if (form.interests.length > 0) {
    child.interests = form.interests;
  }
  if (form.challenges.length > 0) {
    child.challenges = form.challenges;
  }
  return child;
}

/**
 * Validates a single child's data independently.
 * Returns a map of field names to error messages (empty if valid).
 */
function validateChild(child: ChildFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (child.name.length < VALIDATION.CHILD_NAME_MIN) {
    errors.name = `Name must be at least ${VALIDATION.CHILD_NAME_MIN} characters`;
  } else if (child.name.length > VALIDATION.CHILD_NAME_MAX) {
    errors.name = `Name must be under ${VALIDATION.CHILD_NAME_MAX} characters`;
  }

  if (!child.birthDate) {
    errors.birthDate = 'Birth date is required';
  } else {
    const date = new Date(child.birthDate);
    const now = new Date();
    if (date > now) {
      errors.birthDate = 'Birth date cannot be in the future';
    } else {
      const ageInYears = (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (ageInYears > VALIDATION.MAX_CHILD_AGE_YEARS) {
        errors.birthDate = `Child must be under ${VALIDATION.MAX_CHILD_AGE_YEARS} years old`;
      }
    }
  }

  return errors;
}

/**
 * Validates all children independently and returns a map of childId → errors.
 * Returns an empty object if all children are valid.
 */
function validateChildren(children: ChildFormData[]): ChildErrors {
  const allErrors: ChildErrors = {};
  for (const child of children) {
    const childErrors = validateChild(child);
    if (Object.keys(childErrors).length > 0) {
      allErrors[child.id] = childErrors;
    }
  }
  return allErrors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ChildrenForm = forwardRef<HTMLFormElement, ChildrenFormProps>(function ChildrenForm(
  { onSubmit, initialData, isSubmitting = false },
  ref,
) {
  const [children, setChildren] = useState<ChildFormData[]>(
    initialData?.map(toChildFormData) ?? [],
  );
  const [errors, setErrors] = useState<ChildErrors>({});

  // Add a new empty child form
  const addChild = useCallback(() => {
    if (children.length >= VALIDATION.MAX_CHILDREN) return;
    setChildren((prev) => [
      ...prev,
      { id: generateId(), name: '', birthDate: '', gender: '', interests: [], challenges: [] },
    ]);
  }, [children.length]);

  // Remove a child by id
  const removeChild = useCallback((id: string) => {
    setChildren((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Update a field on a specific child
  const updateChild = useCallback(
    (id: string, field: string, value: string | string[]) => {
      setChildren((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      );
    },
    [],
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all children independently
    const validationErrors = validateChildren(children);
    setErrors(validationErrors);

    // If any child has errors, don't submit
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const data = children.map(toChildData);
    onSubmit(data);
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Illustration */}
      <div className="flex justify-center">
        <Image
          src="/illustrations/onboarding-children.webp"
          alt="Children"
          width={200}
          height={200}
          className="max-w-[160px] h-auto"
          priority
        />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white">
          How many children do you have?
        </h1>
        <p className="text-gray-400">
          Tell us about your children so we can personalize your coaching
        </p>
      </div>

      {/* Children List */}
      <div className="space-y-4">
        {children.length === 0 && (
          <p className="text-gray-400 text-center py-4">
            Add your children when you&apos;re ready. You can always do this later.
          </p>
        )}

        {children.map((child, index) => (
          <ChildCard
            key={child.id}
            index={index}
            id={child.id}
            name={child.name}
            birthDate={child.birthDate}
            gender={child.gender}
            interests={child.interests}
            challenges={child.challenges}
            onChange={(field, value) => updateChild(child.id, field, value)}
            onRemove={() => removeChild(child.id)}
            errors={errors[child.id]}
          />
        ))}
      </div>

      {/* Add another child button */}
      {children.length < VALIDATION.MAX_CHILDREN && (
        <button
          type="button"
          onClick={addChild}
          className="w-full border border-dashed border-white/20 rounded-xl py-3 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/50 transition-colors text-sm font-medium"
        >
          + Add another child
        </button>
      )}

      {/* Submit button is hidden — parent OnboardingLayout provides navigation */}
      <button type="submit" className="sr-only" disabled={isSubmitting} tabIndex={-1}>
        Submit
      </button>
    </form>
  );
});
