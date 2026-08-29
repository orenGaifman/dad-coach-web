'use client';

/**
 * Magic Link Authentication Page
 *
 * Handles incoming dashboard links from WhatsApp coaching messages.
 * When a father clicks a link in WhatsApp, they arrive here with a
 * token that authenticates them and redirects to the appropriate page.
 *
 * Flow:
 * 1. Father receives link in WhatsApp (e.g., after logging quality time)
 * 2. Father clicks link and lands on this page with ?token=xxx
 * 3. This page validates the token with the backend
 * 4. On success, stores auth token and redirects to dashboard
 * 5. On failure, shows error with option to log in manually
 *
 * @see src/config/dashboard-link.ts - Link generation utilities
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { apiClient } from '@/src/lib/api-client';
import { AUTH_TOKEN_KEY } from '@/src/config/auth';
import { analytics } from '@/src/services/analytics';

type AuthStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

interface MagicLinkResponse {
  response_status: 'OK' | 'ERROR';
  access_token?: string;
  redirect_path?: string;
  error_code?: string;
  error_message?: string;
}

/**
 * Loading fallback component for Suspense boundary.
 */
function MagicLinkLoading() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Image
            src="/logo.webp"
            alt="Dad Coach"
            width={80}
            height={80}
            className="mx-auto"
            priority
          />
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-white">
            Opening your dashboard...
          </h2>
          <p className="text-gray-400">
            Just a moment while we get things ready for you.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inner component that uses useSearchParams (must be wrapped in Suspense).
 */
function MagicLinkAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const redirectPath = searchParams.get('redirect') ?? '/dashboard';
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');

    console.log('[MagicLink] Starting validation', { token: token?.substring(0, 8) + '...', redirectPath });

    // Track magic link click
    analytics.track('page_view', {
      page_name: 'Magic Link Auth',
      page_path: '/auth/magic',
      utm_source: utmSource ?? undefined,
      utm_campaign: utmCampaign ?? undefined,
    });

    if (!token) {
      console.log('[MagicLink] No token provided');
      setStatus('invalid');
      setErrorMessage('No authentication token provided.');
      return;
    }

    // Validate the magic link token with the backend
    async function validateToken() {
      try {
        console.log('[MagicLink] Calling API...');
        const response = await apiClient.post<MagicLinkResponse>(
          '/auth/magic-link/validate',
          { token }
        );
        console.log('[MagicLink] API response:', response);

        if (response.response_status === 'OK' && response.access_token) {
          // Store the auth token
          console.log('[MagicLink] Saving token to localStorage...', { 
            key: AUTH_TOKEN_KEY,
            tokenLength: response.access_token.length,
            tokenPreview: response.access_token.substring(0, 20) + '...'
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
            // Verify it was saved
            const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
            console.log('[MagicLink] Token saved verification:', {
              saved: !!savedToken,
              matches: savedToken === response.access_token
            });
          }

          // Track successful authentication
          analytics.track('page_view', {
            page_name: 'Magic Link Success',
            page_path: '/auth/magic',
            utm_source: utmSource ?? undefined,
            utm_campaign: utmCampaign ?? undefined,
          });

          setStatus('success');

          // Redirect to the intended destination with full page reload
          // This ensures the new auth token is picked up by all components
          const finalRedirect = response.redirect_path ?? redirectPath;
          setTimeout(() => {
            window.location.href = finalRedirect;
          }, 1000);
        } else {
          // Handle specific error codes
          const errorCode = response.error_code;
          if (errorCode === 'TOKEN_EXPIRED') {
            setStatus('expired');
            setErrorMessage('This link has expired. Please request a new one from your coach.');
          } else if (errorCode === 'TOKEN_INVALID') {
            setStatus('invalid');
            setErrorMessage('This link is invalid. Please check the link or request a new one.');
          } else {
            setStatus('error');
            setErrorMessage(response.error_message ?? 'Unable to authenticate. Please try again.');
          }
        }
      } catch (error: unknown) {
        console.error('[MagicLink] Validation failed:', error);
        console.error('Magic link validation failed:', error);
        
        // Check if it's an ApiError with TOKEN_EXPIRED
        const apiError = error as { status?: number; code?: string } | null;
        if (apiError?.status === 401 || apiError?.code === 'TOKEN_EXPIRED') {
          setStatus('expired');
          setErrorMessage('This link has expired. Please request a new one from your coach.');
        } else if (apiError?.code === 'TOKEN_INVALID') {
          setStatus('invalid');
          setErrorMessage('This link is invalid. Please check the link or request a new one.');
        } else {
          setStatus('error');
          setErrorMessage('Unable to connect. Please check your internet connection and try again.');
        }
      }
    }

    validateToken();
  }, [searchParams, router]);

  // Render based on status
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.webp"
            alt="Dad Coach"
            width={80}
            height={80}
            className="mx-auto"
            priority
          />
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-white">
              Opening your dashboard...
            </h2>
            <p className="text-gray-400">
              Just a moment while we get things ready for you.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-teal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Welcome back! 👋
            </h2>
            <p className="text-gray-400">
              Taking you to your dashboard now...
            </p>
          </div>
        )}

        {/* Error State */}
        {(status === 'error' || status === 'expired' || status === 'invalid') && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">
              {status === 'expired' ? 'Link Expired' : 'Unable to Sign In'}
            </h2>
            <p className="text-gray-400">{errorMessage}</p>

            <div className="pt-4 space-y-3">
              {/* Retry with WhatsApp */}
              <button
                onClick={() => {
                  // Open WhatsApp to request a new link
                  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent('Please send me a new dashboard link')}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="w-full py-3 bg-[#25D366] hover:bg-[#22c55e] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Request New Link via WhatsApp
              </button>

              {/* Manual login option */}
              <button
                onClick={() => router.push('/join')}
                className="w-full py-3 bg-[#1E293B] hover:bg-[#2D3B4F] text-white font-medium rounded-xl transition-colors border border-white/10"
              >
                Sign In Manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main page component with Suspense boundary for useSearchParams.
 */
export default function MagicLinkAuthPage() {
  return (
    <Suspense fallback={<MagicLinkLoading />}>
      <MagicLinkAuthContent />
    </Suspense>
  );
}
