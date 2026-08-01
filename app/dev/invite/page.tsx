'use client';

import { useState, useEffect } from 'react';

interface FatherSummary {
  id: string;
  displayName: string | null;
  phoneNumber: string;
  status: string;
  locale: string;
  createdAt: string;
}

interface WhatsAppStatus {
  configured: boolean;
  api_status?: string;
  verified_name?: string;
  display_phone_number?: string;
  quality_rating?: string;
  code_verification_status?: string;
  name_status?: string;
  error?: string;
}

export default function DevInvitePage() {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fathers, setFathers] = useState<FatherSummary[]>([]);
  const [loadingFathers, setLoadingFathers] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const MAX_TEST_RECIPIENTS = 5;

  // Load fathers and WhatsApp status on mount
  useEffect(() => {
    loadFathers();
    loadWhatsAppStatus();
  }, []);

  async function loadWhatsAppStatus() {
    setLoadingStatus(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
      // phone-status is on webhook path, not api path
      const baseUrl = backendUrl.replace('/api/v1', '');
      const res = await fetch(`${baseUrl}/webhook/whatsapp/phone-status`);
      if (res.ok) {
        const data = await res.json();
        setWhatsappStatus(data);
      }
    } catch (err) {
      console.error('Failed to load WhatsApp status:', err);
      setWhatsappStatus({ configured: false, error: 'Failed to connect' });
    } finally {
      setLoadingStatus(false);
    }
  }

  async function loadFathers() {
    setLoadingFathers(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
      const res = await fetch(`${backendUrl}/admin/fathers?page_size=100`);
      if (res.ok) {
        const data = await res.json();
        setFathers(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load fathers:', err);
    } finally {
      setLoadingFathers(false);
    }
  }

  async function deleteFather(fatherId: string) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(fatherId);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
      const res = await fetch(`${backendUrl}/admin/fathers/${fatherId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Reload the list
        await loadFathers();
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body?.error?.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
    } finally {
      setDeleteLoading(null);
    }
  }

  async function generateInvite() {
    setLoading(true);
    setError(null);
    setLink(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
      const res = await fetch(`${backendUrl}/invitations`, {
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

      // Mark as SENT via backend endpoint
      const sentRes = await fetch(`${backendUrl}/invitations/${token}/mark-sent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!sentRes.ok) {
        console.warn('mark-sent failed, invitation may need manual status update');
      }

      setLink(`${window.location.origin}/join/${token}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const remainingSlots = MAX_TEST_RECIPIENTS - fathers.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-white text-center">
          Dev: Invite Management
        </h1>

        {/* Test Recipients Warning */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-amber-300">Test Mode Limitation</h3>
              <p className="text-amber-200/80 text-sm mt-1">
                Using Meta test number - limited to <strong>{MAX_TEST_RECIPIENTS} recipients</strong>.
                <br />
                Each phone must be added to{' '}
                <a 
                  href="https://developers.facebook.com/apps/1025161893458583/use_cases/customize/api-testing-v2/?use_case_enum=WHATSAPP_BUSINESS_MESSAGING"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-100"
                >
                  Meta Test Recipients →
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Status */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📱</span> WhatsApp Status
            </h2>
            <button 
              onClick={loadWhatsAppStatus}
              disabled={loadingStatus}
              className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 transition-colors disabled:opacity-50"
            >
              {loadingStatus ? '...' : '🔄 Refresh'}
            </button>
          </div>

          {loadingStatus ? (
            <div className="text-center py-3 text-gray-400">Loading WhatsApp status...</div>
          ) : whatsappStatus?.error ? (
            <div className="text-red-300 text-sm">❌ {whatsappStatus.error}</div>
          ) : whatsappStatus?.configured ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Status</div>
                <div className={`font-medium ${
                  whatsappStatus.api_status === 'connected' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {whatsappStatus.api_status === 'connected' ? '✅ Connected' : '❌ ' + whatsappStatus.api_status}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Quality</div>
                <div className={`font-medium ${
                  whatsappStatus.quality_rating === 'GREEN' ? 'text-green-400' :
                  whatsappStatus.quality_rating === 'YELLOW' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {whatsappStatus.quality_rating === 'GREEN' ? '🟢' :
                   whatsappStatus.quality_rating === 'YELLOW' ? '🟡' : '🔴'} {whatsappStatus.quality_rating || 'Unknown'}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Verified Name</div>
                <div className="text-white font-medium truncate">{whatsappStatus.verified_name || 'Not verified'}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Phone Number</div>
                <div className="text-white font-medium">{whatsappStatus.display_phone_number || 'N/A'}</div>
              </div>
              {whatsappStatus.name_status && (
                <div className="bg-white/5 rounded-lg p-3 col-span-2">
                  <div className="text-gray-400 text-xs mb-1">Name Status</div>
                  <div className="text-white font-medium">{whatsappStatus.name_status}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">WhatsApp not configured</div>
          )}
        </div>

        {/* Registered Users Section */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Registered Users ({fathers.length}/{MAX_TEST_RECIPIENTS})
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm ${
              remainingSlots > 0 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {remainingSlots > 0 ? `${remainingSlots} slots left` : 'Full'}
            </span>
          </div>

          {loadingFathers ? (
            <div className="text-center py-4 text-gray-400">Loading...</div>
          ) : fathers.length === 0 ? (
            <div className="text-center py-4 text-gray-400">No users registered yet</div>
          ) : (
            <div className="space-y-2">
              {fathers.map((father) => (
                <div 
                  key={father.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {father.displayName || 'Unknown'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        father.locale === 'he' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {father.locale === 'he' ? '🇮🇱 HE' : '🇺🇸 EN'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        father.status === 'ACTIVE' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {father.status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">{father.phoneNumber}</div>
                  </div>
                  <button
                    onClick={() => deleteFather(father.id)}
                    disabled={deleteLoading === father.id}
                    className="ml-2 px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm transition-colors disabled:opacity-50"
                  >
                    {deleteLoading === father.id ? '...' : '🗑️ Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Invite Section */}
        <div className="space-y-4">
          <button
            onClick={generateInvite}
            disabled={loading || remainingSlots <= 0}
            className="w-full py-3 px-6 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {loading ? 'Generating...' : remainingSlots <= 0 ? 'No Slots Available' : 'Generate New Invite Link'}
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

        {/* Instructions */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-2">📋 How to add a new user:</h3>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>First add their phone to <a href="https://developers.facebook.com/apps/1025161893458583/use_cases/customize/api-testing-v2/?use_case_enum=WHATSAPP_BUSINESS_MESSAGING" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Meta Test Recipients</a></li>
            <li>Generate an invite link above</li>
            <li>Share the link with your friend</li>
            <li>They complete the onboarding wizard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
