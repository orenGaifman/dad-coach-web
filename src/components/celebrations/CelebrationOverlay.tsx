'use client';

/**
 * CelebrationOverlay — Generic confetti celebration animation component
 *
 * Displays a full-screen confetti particle animation that overlays content.
 * Uses pure CSS animations for performance - no external dependencies.
 * Auto-dismisses after configurable duration (default 3 seconds).
 *
 * Features:
 * - Full-screen overlay with transparent background
 * - Configurable animation duration
 * - Does not block user interaction (pointer-events: none)
 * - Respects prefers-reduced-motion preference
 * - Callback when animation completes
 * - Lightweight CSS-only implementation
 *
 * Accessibility:
 * - Hidden from screen readers (decorative animation)
 * - Respects prefers-reduced-motion media query
 *
 * Requirements: 13.3 (celebration animation for belt level ups)
 * @see design.md - Frontend celebration animations
 */

import { useEffect, useState, useCallback, useMemo } from 'react';

/**
 * Configuration for individual confetti particles.
 */
interface ConfettiParticle {
  /** Unique identifier */
  id: number;
  /** Horizontal position (0-100%) */
  left: number;
  /** Animation delay (0-1s) */
  delay: number;
  /** Animation duration (2-4s) */
  duration: number;
  /** Rotation amount (0-720deg) */
  rotation: number;
  /** Particle color */
  color: string;
  /** Particle size (8-16px) */
  size: number;
  /** Horizontal drift during fall (-50 to 50px) */
  drift: number;
}

/**
 * Available confetti colors - festive palette.
 */
const CONFETTI_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Coral red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky blue
  '#96CEB4', // Mint green
  '#FFEAA7', // Light yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Sea green
  '#F7DC6F', // Pale gold
  '#BB8FCE', // Light purple
];

/**
 * Props for the CelebrationOverlay component.
 */
export interface CelebrationOverlayProps {
  /** Animation duration in milliseconds (default: 3000ms) */
  duration?: number;
  /** Number of confetti particles (default: 50) */
  particleCount?: number;
  /** Callback fired when animation completes */
  onComplete?: () => void;
  /** Whether the overlay is visible (controls mounting/unmounting) */
  isVisible?: boolean;
}

/**
 * Generate a random number within a range.
 */
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate confetti particle configurations.
 */
function generateParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: randomInRange(0, 100),
    delay: randomInRange(0, 0.8),
    duration: randomInRange(2, 3.5),
    rotation: randomInRange(0, 720),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: randomInRange(8, 14),
    drift: randomInRange(-40, 40),
  }));
}

/**
 * CelebrationOverlay component.
 *
 * A decorative confetti animation overlay that celebrates user achievements.
 * The overlay covers the entire screen but does not block interaction with
 * underlying UI elements.
 *
 * @example
 * // Basic usage with default 3 second duration
 * <CelebrationOverlay isVisible={showCelebration} onComplete={() => setShowCelebration(false)} />
 *
 * @example
 * // Custom duration and particle count
 * <CelebrationOverlay
 *   isVisible={true}
 *   duration={5000}
 *   particleCount={75}
 *   onComplete={handleComplete}
 * />
 */
export function CelebrationOverlay({
  duration = 3000,
  particleCount = 50,
  onComplete,
  isVisible = true,
}: CelebrationOverlayProps) {
  const [isActive, setIsActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Generate particles only once per mount
  const particles = useMemo(() => generateParticles(particleCount), [particleCount]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle visibility and auto-dismiss
  useEffect(() => {
    if (!isVisible) {
      setIsActive(false);
      return;
    }

    setIsActive(true);

    // Auto-dismiss after duration
    const timeoutId = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [isVisible, duration, onComplete]);

  // Don't render if not visible
  if (!isVisible || !isActive) {
    return null;
  }

  // For reduced motion, show a brief flash instead of animation
  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-transparent animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 confetti-particle"
          style={{
            left: `${particle.left}%`,
            width: particle.size,
            height: particle.size * 0.6,
            backgroundColor: particle.color,
            borderRadius: '2px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            ['--drift' as string]: `${particle.drift}px`,
            ['--rotation' as string]: `${particle.rotation}deg`,
          }}
        />
      ))}

      {/* CSS Keyframes - injected as style tag */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes confetti-fall {
            0% {
              transform: translateY(-20px) translateX(0) rotate(0deg);
              opacity: 1;
            }
            25% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) translateX(var(--drift, 0px)) rotate(var(--rotation, 360deg));
              opacity: 0;
            }
          }

          .confetti-particle {
            animation: confetti-fall linear forwards;
            will-change: transform, opacity;
          }
        `
      }} />
    </div>
  );
}

export default CelebrationOverlay;
