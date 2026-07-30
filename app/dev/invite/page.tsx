'use client';

import { useState } from 'react';

export default function DevInvitePage() {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateInvite() {
    setLoading(true);
    setError(null);
    setLink(null);

    try {
      // 1. Create invitation
      const res = await fetch('/api/v1/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SINGLE_USE',
          created_by: '00000000-0000-0000-0000-000000000001',
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || `Failed to create invitation (${res.status})`);
      }

      const data = await res.json();
      const token = data.token;

      // 2. Mark as SENT and clear rate limits so the onboarding flow works
      await fetch('/api/dev/invitations/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, clearRateLimits: true }),
      });

      setLink(`${window.location.origin}/join/${token}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">
          Dev: Generate Invite Link
        </h1>

        <button
          onClick={generateInvite}
          disabled={loading}
          className="w-full py-3 px-6 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-semibold transition-colors"
        >
          {loading ? 'Generating...' : 'Generate New Invite Link'}
        </button>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-center">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {link && (
          <div className="space-y-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 break-all">
              <a
                href={link}
                className="text-indigo-400 hover:text-indigo-300 underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link}
              </a>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link);
              }}
              className="w-full py-2 px-4 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 text-sm transition-colors"
            >
              📋 Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
