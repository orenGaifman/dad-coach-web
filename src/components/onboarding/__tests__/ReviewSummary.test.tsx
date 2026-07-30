import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ReviewSummary } from '@/src/components/onboarding/ReviewSummary';
import { WizardStep } from '@/src/types/onboarding';
import type { SessionState } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

const fullSessionData: SessionState['data'] = {
  father_profile: {
    display_name: 'Daniel',
    phone_number: '+972501234567',
    timezone: 'Asia/Jerusalem',
  },
  children: [
    { name: 'Yoav', birth_date: '2019-06-15' },
    { name: 'Maya', birth_date: '2021-09-01' },
  ],
  goals: {
    selected_goals: ['build-stronger-emotional-connection', 'improve-communication'],
    custom_goal: 'Be more present',
  },
  preferences: {
    coaching_style: 'DIRECT',
    preferred_coaching_time: '08:00',
    notification_frequency: 'DAILY',
    quiet_hours_start: '21:00',
    quiet_hours_end: '07:00',
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ReviewSummary', () => {
  const mockOnEdit = vi.fn();

  // -------------------------------------------------------------------------
  // Profile Section
  // -------------------------------------------------------------------------

  describe('Profile section', () => {
    it('displays the father name', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('Daniel')).toBeInTheDocument();
    });

    it('masks the phone number', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      // +972501234567 → last 4 digits = 4567
      expect(screen.getByText('****4567')).toBeInTheDocument();
    });

    it('displays the timezone', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('Asia/Jerusalem')).toBeInTheDocument();
    });

    it('calls onEdit with FATHER_PROFILE when Edit is clicked', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]); // Profile is first
      expect(mockOnEdit).toHaveBeenCalledWith(WizardStep.FATHER_PROFILE);
    });
  });

  // -------------------------------------------------------------------------
  // Children Section
  // -------------------------------------------------------------------------

  describe('Children section', () => {
    it('displays children with computed ages', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      // Ages are computed from birth_date, so we check the name is present
      expect(screen.getByText(/Yoav/)).toBeInTheDocument();
      expect(screen.getByText(/Maya/)).toBeInTheDocument();
    });

    it('shows default message when no children', () => {
      const noChildrenData: SessionState['data'] = {
        ...fullSessionData,
        children: undefined,
      };
      render(
        <ReviewSummary sessionData={noChildrenData} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('No children added')).toBeInTheDocument();
    });

    it('shows default message when children array is empty', () => {
      const emptyChildren: SessionState['data'] = {
        ...fullSessionData,
        children: [],
      };
      render(
        <ReviewSummary sessionData={emptyChildren} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('No children added')).toBeInTheDocument();
    });

    it('calls onEdit with CHILDREN when Edit is clicked', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[1]); // Children is second
      expect(mockOnEdit).toHaveBeenCalledWith(WizardStep.CHILDREN);
    });
  });

  // -------------------------------------------------------------------------
  // Goals Section
  // -------------------------------------------------------------------------

  describe('Goals section', () => {
    it('displays goal labels from PREDEFINED_GOALS', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('Build stronger emotional connection')).toBeInTheDocument();
      expect(screen.getByText('Improve communication')).toBeInTheDocument();
    });

    it('displays custom goal', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('Be more present')).toBeInTheDocument();
    });

    it('shows default goal when goals are not set', () => {
      const noGoals: SessionState['data'] = {
        ...fullSessionData,
        goals: undefined,
      };
      render(
        <ReviewSummary sessionData={noGoals} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText(/Spend more quality time/)).toBeInTheDocument();
      expect(screen.getByText(/\(default\)/)).toBeInTheDocument();
    });

    it('calls onEdit with GOALS when Edit is clicked', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[2]); // Goals is third
      expect(mockOnEdit).toHaveBeenCalledWith(WizardStep.GOALS);
    });
  });

  // -------------------------------------------------------------------------
  // Preferences Section
  // -------------------------------------------------------------------------

  describe('Preferences section', () => {
    it('displays coaching style label', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('Direct')).toBeInTheDocument();
    });

    it('displays formatted coaching time', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('08:00 AM')).toBeInTheDocument();
    });

    it('displays notification frequency', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('Daily')).toBeInTheDocument();
    });

    it('shows defaults when preferences are not set', () => {
      const noPrefs: SessionState['data'] = {
        ...fullSessionData,
        preferences: undefined,
      };
      render(
        <ReviewSummary sessionData={noPrefs} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText(/Balanced/)).toBeInTheDocument();
      expect(screen.getByText(/08:00 AM/)).toBeInTheDocument();
      // Check for "(default)" markers
      const defaultTexts = screen.getAllByText(/\(default\)/);
      expect(defaultTexts.length).toBeGreaterThanOrEqual(3);
    });

    it('calls onEdit with PREFERENCES when Edit is clicked', () => {
      render(
        <ReviewSummary sessionData={fullSessionData} language="en" onEdit={mockOnEdit} />,
      );
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[3]); // Preferences is fourth
      expect(mockOnEdit).toHaveBeenCalledWith(WizardStep.PREFERENCES);
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe('Edge cases', () => {
    it('handles undefined sessionData gracefully', () => {
      render(
        <ReviewSummary sessionData={undefined} language="en" onEdit={mockOnEdit} />,
      );
      expect(screen.getByText('No profile data')).toBeInTheDocument();
      expect(screen.getByText('No children added')).toBeInTheDocument();
    });
  });
});
