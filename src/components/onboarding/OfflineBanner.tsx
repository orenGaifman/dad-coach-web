'use client';

export interface OfflineBannerProps {
  isVisible: boolean;
}

export default function OfflineBanner({ isVisible }: OfflineBannerProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-center py-3 px-4 text-sm font-medium shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center gap-2">
        <span aria-hidden="true">📡</span>
        <span>You&apos;re offline. We&apos;ll retry when connected.</span>
      </div>
    </div>
  );
}
