import { describe, expect, it } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import TodosAdd from '@/components/shared/Todos/TodosAdd';
import { AllTheProviders } from '@/AllTheProviders';

describe('TodosAdd component', () => {
  it('should open dialog when button is clicked', () => {
    render(
      <AllTheProviders>
        <TodosAdd />
      </AllTheProviders>
    );
    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it('should see "Add New Item" text if dialog is open', () => {
    render(
      <AllTheProviders>
        <TodosAdd />
      </AllTheProviders>
    );

    const button = screen.getByRole('button');

    fireEvent.click(button);

    const mockText = screen.getByText('Add new todo item');
    expect(mockText).toBeInTheDocument();
  });
});
