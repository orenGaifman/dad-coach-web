'use client';

import { useState, useEffect } from 'react';

interface FatherSummary {
  id: string;
  display_name: string | null;
  phone_number: string;
  status: string;
  locale: string;
  created_at: string;
  current_workflow_state: string | null;
  workflow_state_entered_at: string | null;
  dashboard_url: string | null;
}

interface WhatsAppStatus {
  configured: boolean;
  api_status?: string;
  verified_name?: string;
  display_phone_number?: string;
  quality_rating?: string;
  code_verification_status?: string;
  name_status?: string;
  messaging_limit_tier?: string;
  current_limit?: string;
  error?: string;
}

interface WabaStatus {
  configured: boolean;
  api_status?: string;
  name?: string;
  account_review_status?: string;
  business_verification_status?: string;
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
  const [wabaStatus, setWabaStatus] = useState<WabaStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

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
      
      // Load both phone status and WABA status
      const [phoneRes, wabaRes] = await Promise.all([
        fetch(`${baseUrl}/webhook/whatsapp/phone-status`),
        fetch(`${baseUrl}/webhook/whatsapp/waba-status`)
      ]);
      
      if (phoneRes.ok) {
        const data = await phoneRes.json();
        setWhatsappStatus(data);
      }
      
      if (wabaRes.ok) {
        const data = await wabaRes.json();
        setWabaStatus(data);
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

  // Helper to get messaging limit description
  function getMessagingLimitInfo(tier?: string): { limit: string; color: string } {
    switch (tier) {
      case 'TIER_1K': return { limit: '1,000/day', color: 'text-yellow-400' };
      case 'TIER_10K': return { limit: '10,000/day', color: 'text-green-400' };
      case 'TIER_100K': return { limit: '100,000/day', color: 'text-green-400' };
      case 'UNLIMITED': return { limit: 'Unlimited', color: 'text-green-400' };
      default: return { limit: '250/day (unverified)', color: 'text-orange-400' };
    }
  }

  const messagingLimit = getMessagingLimitInfo(whatsappStatus?.messaging_limit_tier);
  
  // Check if in sandbox/test mode (unverified business = sandbox)
  const isInSandboxMode = wabaStatus?.configured && 
    wabaStatus.business_verification_status !== 'verified';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">
          🛠️ Dev Dashboard
        </h1>

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
                <div className="text-gray-400 text-xs mb-1">API Status</div>
                <div className={`font-medium ${
                  whatsappStatus.api_status === 'connected' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {whatsappStatus.api_status === 'connected' ? '✅ Connected' : '❌ ' + whatsappStatus.api_status}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Quality Rating</div>
                <div className={`font-medium ${
                  whatsappStatus.quality_rating === 'GREEN' ? 'text-green-400' :
                  whatsappStatus.quality_rating === 'YELLOW' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {whatsappStatus.quality_rating === 'GREEN' ? '🟢' :
                   whatsappStatus.quality_rating === 'YELLOW' ? '🟡' : '🔴'} {whatsappStatus.quality_rating || 'Unknown'}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Messaging Limit</div>
                <div className={`font-medium ${messagingLimit.color}`}>
                  📊 {messagingLimit.limit}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">Phone Number</div>
                <div className="text-white font-medium">{whatsappStatus.display_phone_number || 'N/A'}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 col-span-2">
                <div className="text-gray-400 text-xs mb-1">Verified Name</div>
                <div className="text-white font-medium">{whatsappStatus.verified_name || 'Not verified'}</div>
              </div>
              {wabaStatus?.configured && wabaStatus.api_status === 'connected' && (
                <>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Business Account</div>
                    <div className="text-white font-medium truncate">{wabaStatus.name || 'N/A'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Business Verification</div>
                    <div className={`font-medium ${
                      wabaStatus.business_verification_status === 'verified' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {wabaStatus.business_verification_status === 'verified' ? '✅ Verified' : '⏳ ' + (wabaStatus.business_verification_status || 'Pending')}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">WhatsApp not configured</div>
          )}
        </div>

        {/* Sandbox Mode Warning */}
        {isInSandboxMode && (
          <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-orange-300 font-semibold mb-2">WhatsApp Sandbox Mode</h3>
                <p className="text-orange-200/80 text-sm mb-3">
                  Your WhatsApp Business is in <strong>test/sandbox mode</strong>. 
                  Messages can only be sent to phone numbers you manually add to the allowed list.
                </p>
                <p className="text-orange-200/60 text-xs mb-3">
                  Error you may see: <code className="bg-black/30 px-1 rounded">#131030 Recipient phone number not in allowed list</code>
                </p>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="https://developers.facebook.com/apps/1025161893458583/use_cases/customize/?use_case_enum=WHATSAPP_BUSINESS_MESSAGING"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 text-sm transition-colors"
                  >
                    ➕ Add Test Numbers
                  </a>
                  <a 
                    href="https://developers.facebook.com/apps/1025161893458583/use_cases/customize/?use_case_enum=WHATSAPP_BUSINESS_MESSAGING&selected_tab=production_setup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-200 text-sm transition-colors"
                  >
                    🚀 Complete Production Setup
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* App Stats */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>📊</span> App Statistics
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-white">{fathers.length}</div>
              <div className="text-gray-400 text-xs mt-1">Total Users</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">
                {fathers.filter(f => f.status === 'ACTIVE').length}
              </div>
              <div className="text-gray-400 text-xs mt-1">Active</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">
                {fathers.filter(f => f.locale === 'he').length}
              </div>
              <div className="text-gray-400 text-xs mt-1">Hebrew 🇮🇱</div>
            </div>
          </div>
        </div>

        {/* Registered Users Section */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>👥</span> Registered Users
            </h2>
            <button
              onClick={loadFathers}
              disabled={loadingFathers}
              className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 transition-colors disabled:opacity-50"
            >
              {loadingFathers ? '...' : '🔄'}
            </button>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium truncate">
                        {father.display_name || 'Unknown'}
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
                      {father.current_workflow_state && (
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          father.current_workflow_state === 'WELCOME' 
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : father.current_workflow_state === 'SCHEDULE_QUALITY_TIME'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : father.current_workflow_state === 'WAITING'
                            ? 'bg-orange-500/20 text-orange-300'
                            : father.current_workflow_state === 'QUALITY_TIME_FOLLOW_UP'
                            ? 'bg-pink-500/20 text-pink-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          🔄 {father.current_workflow_state.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm flex items-center gap-2">
                      <span>{father.phone_number}</span>
                      {father.workflow_state_entered_at && (
                        <span className="text-gray-500 text-xs">
                          • State since: {new Date(father.workflow_state_entered_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFather(father.id)}
                    disabled={deleteLoading === father.id}
                    className="ml-2 px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm transition-colors disabled:opacity-50"
                  >
                    {deleteLoading === father.id ? '...' : '🗑️'}
                  </button>
                  {father.dashboard_url && (
                    <a
                      href={father.dashboard_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 px-3 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm transition-colors"
                      title="Open Dashboard"
                    >
                      📊
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Invite Section */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>🔗</span> Invite New User
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={generateInvite}
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Invite Link'}
            </button>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {link && (
              <div className="space-y-3">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3 break-all">
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
                  className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-sm transition-colors"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>🔗</span> Quick Links
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <a 
              href="https://developers.facebook.com/apps/1025161893458583/dashboard/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              📱 Meta App Dashboard
            </a>
            <a 
              href="https://business.facebook.com/latest/whatsapp_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              💼 WhatsApp Manager
            </a>
            <a 
              href="https://dashboard.render.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              🚀 Render Dashboard
            </a>
            <a 
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              ▲ Vercel Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
