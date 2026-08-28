'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from './OnboardingProvider';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CalendarConnectProps {
  /** Called when calendar is successfully connected */
  onConnected: () => void;
  /** Called when user skips calendar connection */
  onSkip?: () => void;
  /** Father ID needed for OAuth flow */
  fatherId?: number;
  /** Whether to allow skipping */
  allowSkip?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CalendarConnect — Google Calendar connection step for onboarding.
 *
 * Shows a "Connect with Google" button that initiates the OAuth flow.
 * After successful connection, calls onConnected callback.
 */
export function CalendarConnect({
  onConnected,
  onSkip,
  fatherId,
  allowSkip = false,
}: CalendarConnectProps) {
  const { language } = useOnboarding();
  const isHebrew = language === 'he';
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL params for OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const calendarConnected = params.get('calendar_connected');
    const calendarError = params.get('calendar_error');

    if (calendarConnected === 'true') {
      setIsConnected(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-proceed after short delay
      setTimeout(() => onConnected(), 1500);
    } else if (calendarError) {
      setError(calendarError);
      setIsConnecting(false);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onConnected]);

  const handleConnect = () => {
    if (!fatherId) {
      setError(isHebrew ? 'שגיאה: מזהה משתמש חסר' : 'Error: Missing user ID');
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Redirect to backend OAuth endpoint
    // After OAuth completion, redirect to /workspace (dashboard) to avoid
    // returning to onboarding pages that may try to access completed sessions
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dad-coach.onrender.com/api/v1';
    const redirectUrl = window.location.origin + '/workspace';
    const redirectParam = encodeURIComponent(redirectUrl);
    const connectUrl = `${apiBaseUrl}/calendar/connect/${fatherId}?redirectUrl=${redirectParam}`;
    
    // Open in same window - will redirect back after OAuth
    window.location.href = connectUrl;
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  // Success state
  if (isConnected) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">
          {isHebrew ? '✅ לוח השנה מחובר!' : '✅ Calendar Connected!'}
        </h2>
        <p className="text-gray-400">
          {isHebrew 
            ? 'ממשיכים לשלב הבא...' 
            : 'Continuing to next step...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
          <span className="text-3xl">📅</span>
        </div>
        <h2 className="text-2xl font-bold text-white">
          {isHebrew ? 'חבר את לוח השנה' : 'Connect Your Calendar'}
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          {isHebrew 
            ? 'חיבור לוח השנה שלך יעזור לנו למצוא זמנים פנויים לזמן איכות עם הילדים ולתאם אוטומטית.'
            : 'Connecting your calendar helps us find available times for quality time with your kids and schedule automatically.'}
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
          <span className="text-xl">🔍</span>
          <div>
            <p className="text-white text-sm font-medium">
              {isHebrew ? 'מציאת זמנים פנויים' : 'Find available times'}
            </p>
            <p className="text-gray-400 text-xs">
              {isHebrew 
                ? 'נראה מתי יש לך זמן פנוי בלוח' 
                : "We'll see when you have free time"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
          <span className="text-xl">📆</span>
          <div>
            <p className="text-white text-sm font-medium">
              {isHebrew ? 'תזמון אוטומטי' : 'Automatic scheduling'}
            </p>
            <p className="text-gray-400 text-xs">
              {isHebrew 
                ? 'זמן האיכות יתווסף אוטומטית ללוח שלך' 
                : "Quality time gets added to your calendar automatically"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
          <span className="text-xl">🔔</span>
          <div>
            <p className="text-white text-sm font-medium">
              {isHebrew ? 'תזכורות' : 'Reminders'}
            </p>
            <p className="text-gray-400 text-xs">
              {isHebrew 
                ? 'תקבל תזכורת לפני זמן האיכות' 
                : "You'll get a reminder before quality time"}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
          <p className="text-red-300 text-sm text-center">
            {isHebrew ? `שגיאה: ${error}` : `Error: ${error}`}
          </p>
        </div>
      )}

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{isHebrew ? 'מתחבר...' : 'Connecting...'}</span>
          </>
        ) : (
          <>
            {/* Google Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{isHebrew ? 'התחבר עם Google' : 'Connect with Google'}</span>
          </>
        )}
      </button>

      {/* Privacy note */}
      <p className="text-center text-gray-500 text-xs">
        {isHebrew 
          ? 'אנחנו ניגש רק לאירועים בלוח השנה שלך. לא נשתף או נשנה שום מידע אחר.'
          : "We only access your calendar events. We won't share or modify any other data."}
      </p>

      {/* Skip option */}
      {allowSkip && onSkip && (
        <button
          onClick={handleSkip}
          className="w-full text-center text-gray-400 text-sm hover:text-white transition-colors"
        >
          {isHebrew ? 'דלג לעכשיו' : 'Skip for now'}
        </button>
      )}
    </div>
  );
}

export default CalendarConnect;
