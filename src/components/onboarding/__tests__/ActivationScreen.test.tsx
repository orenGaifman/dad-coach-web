import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ActivationScreen from '@/src/components/onboarding/ActivationScreen';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  deepLink: 'https://wa.me/972501234567?text=%F0%9F%9A%80%20START',
  activationMessage: 'Hi Coach, I\'m ready!',
  isPolling: true,
  pollingError: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ActivationScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero illustration with correct src', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} />);

    const img = screen.getByAltText('Father connecting with coach on WhatsApp');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/illustrations/onboarding-activation.webp');
  });

  it('renders the heading and description text', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} />);

    expect(screen.getByRole('heading', { level: 2, name: /welcome to dad coach/i })).toBeInTheDocument();
    expect(screen.getByText(/your coach is already waiting/i)).toBeInTheDocument();
  });

  it('renders the WhatsApp button with correct deep link', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} />);

    const link = screen.getByRole('link', { name: /open whatsapp/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', DEFAULT_PROPS.deepLink);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the copy message section with activation message text', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} />);

    expect(screen.getByText(/or copy this message/i)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_PROPS.activationMessage)).toBeInTheDocument();
  });

  it('copies activation message to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ActivationScreen {...DEFAULT_PROPS} />);

    const copyButton = screen.getByRole('button', { name: /copy activation message/i });
    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith(DEFAULT_PROPS.activationMessage);
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('shows polling indicator when isPolling is true', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} isPolling={true} />);

    expect(screen.getByText(/waiting for connection/i)).toBeInTheDocument();
  });

  it('hides polling indicator when isPolling is false', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} isPolling={false} />);

    expect(screen.queryByText(/waiting for connection/i)).not.toBeInTheDocument();
  });

  it('shows polling error when present', () => {
    render(
      <ActivationScreen {...DEFAULT_PROPS} pollingError="Connection issue — retrying..." />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Connection issue — retrying...');
  });

  it('does not show error alert when pollingError is null', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} pollingError={null} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the footer text', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} />);

    expect(screen.getByText(/the journey begins now/i)).toBeInTheDocument();
  });

  it('WhatsApp button has accessible label', () => {
    render(<ActivationScreen {...DEFAULT_PROPS} />);

    const link = screen.getByLabelText(/open whatsapp to start coaching conversation/i);
    expect(link).toBeInTheDocument();
  });
});
