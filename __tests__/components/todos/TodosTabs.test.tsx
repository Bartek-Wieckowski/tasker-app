import { AllTheProviders } from '@/AllTheProviders';
import TodosTabs from '@/components/shared/Todos/TodosTabs';
import { Tabs } from '@/components/ui/tabs';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    selectedDate: '2023-08-10',
    currentUser: { id: 'user-1' },
  }),
}));

vi.mock('@/api/queries/todos/useTodosByDate', () => ({
  useTodosByDate: vi.fn().mockReturnValue({
    isLoading: false,
    todos: [],
  }),
}));

describe('TodosTabs component', () => {
  it('should show initial text if todos list is empty', async () => {
    render(
      <AllTheProviders>
        <Tabs>
          <TodosTabs />
        </Tabs>
      </AllTheProviders>
    );

    await waitFor(() => {
      const initialText = screen.getByText(/Add your first task!/i);
      expect(initialText).toBeInTheDocument();
    });
  });
});
