import { describe, expect, it, vi } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import { AllTheProviders } from '@/AllTheProviders';
import TodoForm from '@/components/shared/Todos/TodoForm';

describe('TodosForm component', () => {
  it('should show error msg when user send empty inputs', async () => {
    const mockOnCloseDialog = vi.fn();
    render(
      <AllTheProviders>
        <TodoForm action="Create" onCloseDialog={mockOnCloseDialog} />
      </AllTheProviders>
    );
    const button = screen.getByRole('button', { name: /Create Todo Item/i });

    fireEvent.click(button);

    const mockErrorText = await screen.findByText('Todo item must be at least 2 characters.');
    expect(mockErrorText).toBeInTheDocument();
  });
});
