import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { CelebrationOverlay } from './CelebrationOverlay';

describe('CelebrationOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock matchMedia for reduced motion tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders confetti particles when visible', () => {
    render(<CelebrationOverlay isVisible={true} particleCount={10} />);
    
    // Should render the container with aria-hidden for accessibility
    const container = screen.getByRole('presentation', { hidden: true });
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-hidden', 'true');
    
    // Should have confetti particles
    const particles = container.querySelectorAll('.confetti-particle');
    expect(particles.length).toBe(10);
  });

  it('does not render when isVisible is false', () => {
    render(<CelebrationOverlay isVisible={false} />);
    
    const container = screen.queryByRole('presentation', { hidden: true });
    expect(container).not.toBeInTheDocument();
  });

  it('calls onComplete after duration', async () => {
    const onComplete = vi.fn();
    render(
      <CelebrationOverlay
        isVisible={true}
        duration={3000}
        onComplete={onComplete}
      />
    );

    expect(onComplete).not.toHaveBeenCalled();

    // Fast-forward past the duration
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('uses default duration of 3000ms', async () => {
    const onComplete = vi.fn();
    render(<CelebrationOverlay isVisible={true} onComplete={onComplete} />);

    // Should not complete before 3000ms
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onComplete).not.toHaveBeenCalled();

    // Should complete at 3000ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('uses default particle count of 50', () => {
    render(<CelebrationOverlay isVisible={true} />);
    
    const container = screen.getByRole('presentation', { hidden: true });
    const particles = container.querySelectorAll('.confetti-particle');
    expect(particles.length).toBe(50);
  });

  it('does not block pointer events', () => {
    render(<CelebrationOverlay isVisible={true} />);
    
    const container = screen.getByRole('presentation', { hidden: true });
    expect(container).toHaveClass('pointer-events-none');
  });

  it('respects prefers-reduced-motion preference', () => {
    // Mock matchMedia to return reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<CelebrationOverlay isVisible={true} particleCount={50} />);
    
    const container = screen.getByRole('presentation', { hidden: true });
    // Should NOT have confetti particles with reduced motion
    const particles = container.querySelectorAll('.confetti-particle');
    expect(particles.length).toBe(0);
    
    // Should have pulse animation fallback
    const pulseElement = container.querySelector('.animate-pulse');
    expect(pulseElement).toBeInTheDocument();
  });

  it('cleans up timeout on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <CelebrationOverlay
        isVisible={true}
        duration={3000}
        onComplete={onComplete}
      />
    );

    unmount();

    // Fast-forward past duration - should not call onComplete since component unmounted
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('handles visibility change from true to false', () => {
    const { rerender } = render(<CelebrationOverlay isVisible={true} />);
    
    expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument();

    rerender(<CelebrationOverlay isVisible={false} />);
    
    expect(screen.queryByRole('presentation', { hidden: true })).not.toBeInTheDocument();
  });

  it('generates particles with varied properties', () => {
    render(<CelebrationOverlay isVisible={true} particleCount={20} />);
    
    const container = screen.getByRole('presentation', { hidden: true });
    const particles = container.querySelectorAll('.confetti-particle');
    
    // Check that particles have style attributes (they should have inline styles)
    const firstParticle = particles[0] as HTMLElement;
    const secondParticle = particles[1] as HTMLElement;
    
    // Particles should have different positions (left percentage)
    expect(firstParticle.style.left).toBeTruthy();
    expect(secondParticle.style.left).toBeTruthy();
    
    // Particles should have background colors
    expect(firstParticle.style.backgroundColor).toBeTruthy();
    expect(secondParticle.style.backgroundColor).toBeTruthy();
  });
});
