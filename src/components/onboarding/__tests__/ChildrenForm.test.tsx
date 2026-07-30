import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { ChildrenForm } from '@/src/components/onboarding/ChildrenForm';
import { VALIDATION } from '@/src/constants/onboarding';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChildrenForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders the header illustration', () => {
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    const img = screen.getByAltText('Children');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/illustrations/onboarding-children.webp');
  });

  it('renders heading text', () => {
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('How many children do you have?')).toBeInTheDocument();
  });

  it('shows empty state message when no children are added', () => {
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByText(
        "Add your children when you're ready. You can always do this later.",
      ),
    ).toBeInTheDocument();
  });

  it('shows "Add another child" button initially', () => {
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('+ Add another child')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Adding children
  // -------------------------------------------------------------------------

  it('adds a child form when "Add another child" is clicked', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Birth date')).toBeInTheDocument();
    expect(screen.getByText('Boy')).toBeInTheDocument();
    expect(screen.getByText('Girl')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('removes empty state message after adding a child', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));

    expect(
      screen.queryByText(
        "Add your children when you're ready. You can always do this later.",
      ),
    ).not.toBeInTheDocument();
  });

  it('adds multiple children with correct numbering', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));
    await user.click(screen.getByText('+ Add another child'));

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Max children enforcement (Req 5.2)
  // -------------------------------------------------------------------------

  it('hides "Add another child" button when max children reached', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    // Add 8 children (MAX_CHILDREN)
    for (let i = 0; i < VALIDATION.MAX_CHILDREN; i++) {
      await user.click(screen.getByText('+ Add another child'));
    }

    expect(screen.queryByText('+ Add another child')).not.toBeInTheDocument();
    expect(screen.getByText('Child 8')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Removing children
  // -------------------------------------------------------------------------

  it('removes a child when its remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));
    await user.click(screen.getByText('+ Add another child'));

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();

    // Remove child 1
    await user.click(screen.getByLabelText('Remove child 1'));

    expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('shows empty state again after all children are removed', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));
    await user.click(screen.getByLabelText('Remove child 1'));

    expect(
      screen.getByText(
        "Add your children when you're ready. You can always do this later.",
      ),
    ).toBeInTheDocument();
  });

  it('shows "Add another child" button again after removing when at max', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    // Add max children
    for (let i = 0; i < VALIDATION.MAX_CHILDREN; i++) {
      await user.click(screen.getByText('+ Add another child'));
    }
    expect(screen.queryByText('+ Add another child')).not.toBeInTheDocument();

    // Remove one
    await user.click(screen.getByLabelText('Remove child 8'));

    expect(screen.getByText('+ Add another child')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Form submission
  // -------------------------------------------------------------------------

  it('calls onSubmit with child data on form submission', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));

    const nameInput = screen.getByLabelText('Name');
    const birthInput = screen.getByLabelText('Birth date');

    await user.type(nameInput, 'Alice');
    await user.type(birthInput, '2020-05-15');
    await user.click(screen.getByLabelText('Boy'));

    // Submit (hidden button)
    const form = nameInput.closest('form')!;
    form.requestSubmit();

    expect(mockOnSubmit).toHaveBeenCalledWith([
      {
        name: 'Alice',
        birth_date: '2020-05-15',
        gender: 'MALE',
      },
    ]);
  });

  it('omits gender from data when not selected', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));

    const nameInput = screen.getByLabelText('Name');
    const birthInput = screen.getByLabelText('Birth date');

    await user.type(nameInput, 'Bob');
    await user.type(birthInput, '2018-01-01');

    const form = nameInput.closest('form')!;
    form.requestSubmit();

    expect(mockOnSubmit).toHaveBeenCalledWith([
      {
        name: 'Bob',
        birth_date: '2018-01-01',
      },
    ]);
  });

  // -------------------------------------------------------------------------
  // Initial data
  // -------------------------------------------------------------------------

  it('renders initial data when provided', () => {
    render(
      <ChildrenForm
        onSubmit={mockOnSubmit}
        initialData={[
          { name: 'Charlie', birth_date: '2019-03-10', gender: 'FEMALE' },
        ]}
      />,
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Charlie')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2019-03-10')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Per-child validation (Req 5.5, 5.7)
  // -------------------------------------------------------------------------

  it('shows name error when name is too short', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));

    const nameInput = screen.getByLabelText('Name');
    const birthInput = screen.getByLabelText('Birth date');

    await user.type(nameInput, 'A'); // 1 char, below minimum of 2
    await user.type(birthInput, '2020-05-15');

    const form = nameInput.closest('form')!;
    form.requestSubmit();

    expect(
      await screen.findByText(`Name must be at least ${VALIDATION.CHILD_NAME_MIN} characters`),
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows birth date error when date is in the future', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));

    const nameInput = screen.getByLabelText('Name');
    const birthInput = screen.getByLabelText('Birth date');

    await user.type(nameInput, 'Alice');
    await user.type(birthInput, '2099-01-01');

    const form = nameInput.closest('form')!;
    form.requestSubmit();

    expect(await screen.findByText('Birth date cannot be in the future')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows birth date error when child is over 18 years old', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));

    const nameInput = screen.getByLabelText('Name');
    const birthInput = screen.getByLabelText('Birth date');

    await user.type(nameInput, 'Alice');
    await user.type(birthInput, '2000-01-01'); // More than 18 years ago

    const form = nameInput.closest('form')!;
    form.requestSubmit();

    expect(
      await screen.findByText(`Child must be under ${VALIDATION.MAX_CHILD_AGE_YEARS} years old`),
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows birth date required error when not provided', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'Alice');
    // Don't set birthDate

    const form = nameInput.closest('form')!;
    form.requestSubmit();

    expect(await screen.findByText('Birth date is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates each child independently — valid child does not block', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    // Add two children
    await user.click(screen.getByText('+ Add another child'));
    await user.click(screen.getByText('+ Add another child'));

    const nameInputs = screen.getAllByLabelText('Name');
    const birthInputs = screen.getAllByLabelText('Birth date');

    // Child 1: valid
    await user.type(nameInputs[0], 'Alice');
    await user.type(birthInputs[0], '2020-05-15');

    // Child 2: invalid (name too short)
    await user.type(nameInputs[1], 'B');
    await user.type(birthInputs[1], '2020-06-01');

    const form = nameInputs[0].closest('form')!;
    form.requestSubmit();

    // Only child 2 should show an error
    const errorMessages = await screen.findAllByText(
      `Name must be at least ${VALIDATION.CHILD_NAME_MIN} characters`,
    );
    expect(errorMessages).toHaveLength(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits successfully when all children are valid', async () => {
    const user = userEvent.setup();
    render(<ChildrenForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByText('+ Add another child'));
    await user.click(screen.getByText('+ Add another child'));

    const nameInputs = screen.getAllByLabelText('Name');
    const birthInputs = screen.getAllByLabelText('Birth date');

    await user.type(nameInputs[0], 'Alice');
    await user.type(birthInputs[0], '2020-05-15');

    await user.type(nameInputs[1], 'Bob');
    await user.type(birthInputs[1], '2018-06-01');

    const form = nameInputs[0].closest('form')!;
    form.requestSubmit();

    expect(mockOnSubmit).toHaveBeenCalledWith([
      { name: 'Alice', birth_date: '2020-05-15' },
      { name: 'Bob', birth_date: '2018-06-01' },
    ]);
  });
});
