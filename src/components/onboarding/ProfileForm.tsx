'use client';

import { useState, useEffect, useCallback, forwardRef } from 'react';
import Image from 'next/image';
import { z } from 'zod';

import { VALIDATION, DEFAULTS } from '@/src/constants/onboarding';
import { useTranslations } from '@/src/i18n/useTranslations';
import { formatE164, isValidE164 } from '@/src/utils/phone';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COUNTRY_CODES = [
  { code: '+972', label: '🇮🇱 +972' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+7', label: '🇷🇺 +7' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+81', label: '🇯🇵 +81' },
] as const;

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(VALIDATION.DISPLAY_NAME_MIN, `Name must be at least ${VALIDATION.DISPLAY_NAME_MIN} characters`)
    .max(VALIDATION.DISPLAY_NAME_MAX, `Name must be under ${VALIDATION.DISPLAY_NAME_MAX} characters`)
    .regex(/^[\p{L}\s]+$/u, 'Name can only contain letters and spaces'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  countryCode: z.string().min(1, 'Country code is required'),
  email: z
    .string()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
  isSubmitting?: boolean;
  initialData?: Partial<ProfileFormData>;
  serverErrors?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ProfileForm = forwardRef<HTMLFormElement, ProfileFormProps>(function ProfileForm(
  { onSubmit, isSubmitting = false, initialData, serverErrors },
  ref,
) {
  const { t, isRTL } = useTranslations();

  // Form state
  const [displayName, setDisplayName] = useState(initialData?.displayName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber ?? '');
  const [countryCode, setCountryCode] = useState(initialData?.countryCode ?? DEFAULTS.COUNTRY_CODE);
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [timezone, setTimezone] = useState(initialData?.timezone ?? DEFAULTS.TIMEZONE);

  // Validation errors (field → message)
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Track which fields have been blurred for inline validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-detect timezone on mount
  useEffect(() => {
    if (!initialData?.timezone) {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detected) {
          setTimezone(detected);
        }
      } catch {
        // Fallback already set to DEFAULTS.TIMEZONE
      }
    }
  }, [initialData?.timezone]);

  // Validate a single field
  const validateField = useCallback(
    (field: string, value: string) => {
      let error = '';

      switch (field) {
        case 'displayName': {
          const result = profileSchema.shape.displayName.safeParse(value);
          if (!result.success) {
            error = result.error.issues[0].message;
          }
          break;
        }
        case 'phoneNumber': {
          if (!value.trim()) {
            error = 'Phone number is required';
          } else {
            const e164 = formatE164(countryCode, value);
            if (!isValidE164(e164)) {
              error = 'Please enter a valid phone number';
            }
          }
          break;
        }
        case 'email': {
          if (value.trim()) {
            const emailSchema = z.string().email('Please enter a valid email');
            const result = emailSchema.safeParse(value);
            if (!result.success) {
              error = result.error.issues[0].message;
            }
          }
          break;
        }
        case 'timezone': {
          if (!value.trim()) {
            error = 'Timezone is required';
          }
          break;
        }
      }

      return error;
    },
    [countryCode],
  );

  // Handle blur — validate field on blur (Req 4.6)
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Read current value from state
    let value = '';
    switch (field) {
      case 'displayName':
        value = displayName;
        break;
      case 'phoneNumber':
        value = phoneNumber;
        break;
      case 'email':
        value = email;
        break;
      case 'timezone':
        value = timezone;
        break;
    }

    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const formData = { displayName, phoneNumber, countryCode, email, timezone };
    const newErrors: Record<string, string> = {};

    // Schema validation
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!newErrors[field]) {
          newErrors[field] = issue.message;
        }
      }
    }

    // Additional phone E.164 validation
    if (!newErrors['phoneNumber'] && phoneNumber.trim()) {
      const e164 = formatE164(countryCode, phoneNumber);
      if (!isValidE164(e164)) {
        newErrors['phoneNumber'] = 'Please enter a valid phone number';
      }
    }

    if (Object.values(newErrors).some((e) => e !== '')) {
      setErrors(newErrors);
      setTouched({
        displayName: true,
        phoneNumber: true,
        email: true,
        timezone: true,
      });

      // Focus first invalid field (Req 4.7)
      const fieldOrder = ['displayName', 'phoneNumber', 'email', 'timezone'];
      const firstErrorField = fieldOrder.find((f) => newErrors[f]);
      if (firstErrorField) {
        // Use setTimeout to allow error state to render before focusing
        setTimeout(() => {
          document.getElementById(firstErrorField)?.focus();
        }, 0);
      }

      return;
    }

    onSubmit(formData);
  };

  // Merge server errors with client errors
  const getError = (field: string): string => {
    return serverErrors?.[field] || (touched[field] ? errors[field] || '' : '');
  };

  // Input style helpers
  const inputBase =
    'w-full bg-white/5 border rounded-xl py-3 px-4 text-white placeholder-gray-500 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';
  const getInputClassName = (field: string) => {
    const error = getError(field);
    return `${inputBase} ${error ? 'border-red-400' : 'border-white/10'}`;
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} noValidate className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Illustration */}
      <div className="flex justify-center">
        <Image
          src="/illustrations/onboarding-father-info.webp"
          alt="Your Profile"
          width={200}
          height={200}
          className="max-w-[160px] h-auto"
          priority
        />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white">
          {t('onboarding.profile.title')}
        </h1>
        <p className="text-gray-400">{t('onboarding.profile.subtitle')}</p>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="text-sm text-gray-300 mb-1 block">
          {t('onboarding.profile.displayName')}
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => handleBlur('displayName')}
          placeholder={t('onboarding.profile.displayNamePlaceholder')}
          className={getInputClassName('displayName')}
          aria-describedby={getError('displayName') ? 'displayName-error' : undefined}
          aria-invalid={!!getError('displayName')}
          autoComplete="name"
        />
        {getError('displayName') && (
          <p id="displayName-error" className="text-red-400 text-sm mt-1">
            {getError('displayName')}
          </p>
        )}
      </div>

      {/* Phone Number with Country Code */}
      <div>
        <label htmlFor="phoneNumber" className="text-sm text-gray-300 mb-1 block">
          {t('onboarding.profile.whatsappNumber')}
        </label>
        <div className="flex gap-2" dir="ltr">
          <select
            id="countryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none min-w-[100px]"
            aria-label="Country code"
          >
            {COUNTRY_CODES.map(({ code, label }) => (
              <option key={code} value={code} className="bg-gray-900">
                {label}
              </option>
            ))}
          </select>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onBlur={() => handleBlur('phoneNumber')}
            placeholder={t('onboarding.profile.phonePlaceholder')}
            className={`flex-1 ${getInputClassName('phoneNumber')}`}
            aria-describedby={getError('phoneNumber') ? 'phoneNumber-error' : undefined}
            aria-invalid={!!getError('phoneNumber')}
            autoComplete="tel-national"
            dir="ltr"
          />
        </div>
        {getError('phoneNumber') && (
          <p id="phoneNumber-error" className="text-red-400 text-sm mt-1">
            {getError('phoneNumber')}
          </p>
        )}
      </div>

      {/* Email (optional) */}
      <div>
        <label htmlFor="email" className="text-sm text-gray-300 mb-1 block">
          {t('onboarding.profile.emailOptional')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder={t('onboarding.profile.emailPlaceholder')}
          className={getInputClassName('email')}
          aria-describedby={getError('email') ? 'email-error' : undefined}
          aria-invalid={!!getError('email')}
          autoComplete="email"
        />
        {getError('email') && (
          <p id="email-error" className="text-red-400 text-sm mt-1">
            {getError('email')}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="text-sm text-gray-300 mb-1 block">
          {t('onboarding.profile.timezone')}
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          onBlur={() => handleBlur('timezone')}
          className={getInputClassName('timezone')}
          aria-describedby={getError('timezone') ? 'timezone-error' : undefined}
          aria-invalid={!!getError('timezone')}
        >
          <option value="" className="bg-gray-900">
            {t('onboarding.profile.selectTimezone')}
          </option>
          {Intl.supportedValuesOf('timeZone').map((tz) => (
            <option key={tz} value={tz} className="bg-gray-900">
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        {getError('timezone') && (
          <p id="timezone-error" className="text-red-400 text-sm mt-1">
            {getError('timezone')}
          </p>
        )}
      </div>

      {/* Submit button is hidden — parent OnboardingLayout provides navigation */}
      <button type="submit" className="sr-only" disabled={isSubmitting} tabIndex={-1}>
        Submit
      </button>
    </form>
  );
});
