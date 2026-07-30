'use client';

import Image from 'next/image';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActivationSuccessProps {
  /** URL to navigate to (defaults to /workspace). */
  dashboardUrl?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ActivationSuccess — success state after WhatsApp activation completes.
 *
 * Displays celebratory illustration, success heading, and a "Go to Dashboard"
 * button that navigates the father to their workspace.
 *
 * @see Requirements 9.4
 */
export default function ActivationSuccess({
  dashboardUrl = '/workspace',
}: ActivationSuccessProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-4">
      {/* Decorative confetti (positioned behind success illustration) */}
      <div className="relative">
        <Image
          src="/illustrations/celebration-confetti.webp"
          alt=""
          width={300}
          height={300}
          className="absolute inset-0 w-[300px] h-[300px] -top-6 left-1/2 -translate-x-1/2 pointer-events-none"
          aria-hidden="true"
        />
        {/* Success illustration */}
        <Image
          src="/illustrations/onboarding-success.webp"
          alt="Success!"
          width={250}
          height={250}
          className="relative w-[250px] h-[250px] object-cover rounded-2xl"
          priority
        />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-white">
        You&apos;re connected! 🎉
      </h2>

      {/* Description */}
      <p className="text-gray-300">
        Your coaching journey starts now.
      </p>

      {/* Dashboard button */}
      <a
        href={dashboardUrl}
        className="w-full max-w-xs px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-1"
      >
        Go to Dashboard →
      </a>
    </div>
  );
}
