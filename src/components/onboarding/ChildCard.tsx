'use client';

import { useState } from 'react';

import { VALIDATION } from '@/src/constants/onboarding';
import { useTranslations } from '@/src/i18n/useTranslations';
import type { ChildGender } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ChildCardProps {
  index: number;
  id: string;
  name: string;
  birthDate: string;
  gender: ChildGender | '';
  interests: string[];
  challenges: string[];
  onChange: (field: string, value: string | string[]) => void;
  onRemove: () => void;
  errors?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// TagInput — reusable inline tag input component
// ---------------------------------------------------------------------------

interface TagInputProps {
  id: string;
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}

function TagInput({ id, label, tags, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm text-gray-300 mb-1 block">
        {label}
      </label>

      {/* Tag chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-500/20 text-indigo-300 rounded-full px-3 py-1 text-sm flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-indigo-400 hover:text-red-400 transition-colors ml-0.5"
                aria-label={`Remove ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Text input */}
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        autoComplete="off"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChildCard Component
// ---------------------------------------------------------------------------

export function ChildCard({
  index,
  id,
  name,
  birthDate,
  gender,
  interests,
  challenges,
  onChange,
  onRemove,
  errors,
}: ChildCardProps) {
  const { t } = useTranslations();
  const inputBase =
    'w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="border-l-2 border-indigo-500 pl-4 space-y-3">
      {/* Child header with remove button */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">
          {t('onboarding.children.childNumber')} {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-400 transition-colors text-sm"
          aria-label={`${t('onboarding.children.remove')} child ${index + 1}`}
        >
          ✕
        </button>
      </div>

      {/* Name input */}
      <div>
        <label
          htmlFor={`child-name-${id}`}
          className="text-sm text-gray-300 mb-1 block"
        >
          {t('onboarding.children.name')}
        </label>
        <input
          id={`child-name-${id}`}
          type="text"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder={t('onboarding.children.namePlaceholder')}
          className={inputBase}
          minLength={VALIDATION.CHILD_NAME_MIN}
          maxLength={VALIDATION.CHILD_NAME_MAX}
          required
          autoComplete="off"
          aria-describedby={errors?.name ? `child-name-error-${id}` : undefined}
        />
        {errors?.name && (
          <p id={`child-name-error-${id}`} className="text-red-400 text-xs mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Birth date input */}
      <div>
        <label
          htmlFor={`child-birth-${id}`}
          className="text-sm text-gray-300 mb-1 block"
        >
          {t('onboarding.children.birthDate')}
        </label>
        <input
          id={`child-birth-${id}`}
          type="date"
          value={birthDate}
          onChange={(e) => onChange('birthDate', e.target.value)}
          className={inputBase}
          required
          aria-describedby={errors?.birthDate ? `child-birth-error-${id}` : undefined}
        />
        {errors?.birthDate && (
          <p id={`child-birth-error-${id}`} className="text-red-400 text-xs mt-1">
            {errors.birthDate}
          </p>
        )}
      </div>

      {/* Gender radio buttons */}
      <fieldset>
        <legend className="text-sm text-gray-300 mb-2">
          {t('onboarding.children.gender')} ({t('common.optional')})
        </legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
            <input
              type="radio"
              name={`gender-${id}`}
              value="MALE"
              checked={gender === 'MALE'}
              onChange={() => onChange('gender', 'MALE')}
              className="accent-indigo-500"
            />
            {t('onboarding.children.genderBoy')}
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
            <input
              type="radio"
              name={`gender-${id}`}
              value="FEMALE"
              checked={gender === 'FEMALE'}
              onChange={() => onChange('gender', 'FEMALE')}
              className="accent-indigo-500"
            />
            {t('onboarding.children.genderGirl')}
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
            <input
              type="radio"
              name={`gender-${id}`}
              value="PREFER_NOT_TO_SAY"
              checked={gender === 'PREFER_NOT_TO_SAY'}
              onChange={() => onChange('gender', 'PREFER_NOT_TO_SAY')}
              className="accent-indigo-500"
            />
            {t('common.skip')}
          </label>
        </div>
      </fieldset>

      {/* Interests tag input */}
      <TagInput
        id={`child-interests-${id}`}
        label={`${t('onboarding.children.interests')} (${t('common.optional')})`}
        tags={interests}
        onChange={(tags) => onChange('interests', tags)}
        placeholder={t('onboarding.children.interestsPlaceholder')}
      />

      {/* Challenges tag input */}
      <TagInput
        id={`child-challenges-${id}`}
        label={`${t('onboarding.children.challenges')} (${t('common.optional')})`}
        tags={challenges}
        onChange={(tags) => onChange('challenges', tags)}
        placeholder={t('onboarding.children.challengesPlaceholder')}
      />
    </div>
  );
}
