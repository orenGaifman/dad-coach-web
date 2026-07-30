'use client';

import Image from 'next/image';

export interface SessionExpiredProps {
  onStartAgain: () => void;
}

export default function SessionExpired({ onStartAgain }: SessionExpiredProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-8">
      <Image
        src="/illustrations/session-expired.webp"
        alt="Session expired"
        width={150}
        height={150}
        priority
      />
      <h1 className="text-xl font-semibold text-white">Your session has expired</h1>
      <p className="text-gray-300">
        Your session has expired, but the invitation is still valid. Let&apos;s start fresh.
      </p>
      <button
        onClick={onStartAgain}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors"
      >
        Start Again
      </button>
    </div>
  );
}
