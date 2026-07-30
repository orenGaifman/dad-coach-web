'use client';

import Image from 'next/image';

export default function InvitationRevoked() {
  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-8">
      <Image
        src="/illustrations/error-state.webp"
        alt="Invitation revoked"
        width={150}
        height={150}
        priority
      />
      <h1 className="text-xl font-semibold text-white">Invitation No Longer Available</h1>
      <p className="text-gray-300">
        This invitation is no longer available. Please contact the person who shared it with you.
      </p>
    </div>
  );
}
