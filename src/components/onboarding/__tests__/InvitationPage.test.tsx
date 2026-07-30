import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ApiError } from '@/src/lib/api-client';
import type { InvitationValidation } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
const mockRouter = { push: vi.fn(), replace: vi.fn(), back: vi.fn() };
vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'test-token' }),
  useRouter: () => mockRouter,
}));

// Mock next/image to render a plain <img>
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock onboarding service
const mockValidateInvitation = vi.fn<(token: string) => Promise<InvitationValidation>>();
const mockCreateSession = vi.fn();

vi.mock('@/src/services/onboarding', () => ({
  validateInvitation: (...args: unknown[]) => mockValidateInvitation(args[0] as string),
  createSession: (...args: unknown[]) => mockCreateSession(args[0] as string),
}));

// ---------------------------------------------------------------------------
// Import the component under test AFTER mocks are set up
// ---------------------------------------------------------------------------

import InvitationPage from '@/app/join/[token]/page';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InvitationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders WelcomeScreen when invitation is valid', async () => {
    mockValidateInvitation.mockResolvedValue({
      valid: true,
      invitation_id: 'inv-123',
      inviter_display_name: 'John',
    });

    render(<InvitationPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Become the Father You Want to Be/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows invalid error for 404 response', async () => {
    mockValidateInvitation.mockRejectedValue(
      new ApiError(404, { code: 'INVITATION_NOT_FOUND', message: 'Not found' }),
    );

    render(<InvitationPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Invalid Invitation/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/This invitation link isn't valid/i)).toBeInTheDocument();
  });

  it('shows expired message for 410 response', async () => {
    mockValidateInvitation.mockRejectedValue(
      new ApiError(410, {
        code: 'INVITATION_EXPIRED',
        message: 'This invitation has expired or has already been used.',
      }),
    );

    render(<InvitationPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Invitation Expired/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows countdown for 429 response', async () => {
    mockValidateInvitation.mockRejectedValue(
      new ApiError(429, { code: 'RATE_LIMITED', retry_after: 5 }),
    );

    render(<InvitationPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Too Many Attempts/i }),
      ).toBeInTheDocument();
    });

    // The countdown message includes the formatted time (5:00 for 5 minutes * 60 seconds)
    expect(screen.getByText(/try again in 5:00/i)).toBeInTheDocument();
  });

  it('shows connection issue with retry for network offline', async () => {
    mockValidateInvitation.mockRejectedValue(
      new TypeError('Failed to fetch'),
    );

    render(<InvitationPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Connection Issue/i }),
      ).toBeInTheDocument();
    });

    // Verify retry button is present
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });
});
