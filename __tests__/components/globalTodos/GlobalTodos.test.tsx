import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GlobalTodos from '../../../src/components/shared/GlobalTodos/GlobalTodos';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { TodoItemBase } from '@/types/types';
import { AllTheProviders } from '@/AllTheProviders';
import * as globalTodosHooks from '@/api/queries/globalTodos/useGlobalTodos';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

const mockUseGlobalTodos = vi.spyOn(globalTodosHooks, 'useGlobalTodos');

vi.mock('@/api/mutations/globalTodos/useAddGlobalTodo', () => ({
  useAddGlobalTodo: () => ({
    createGlobalTodo: vi.fn(() => Promise.resolve()),
    isCreatingGlobalTodo: false,
  }),
}));

vi.mock('@/api/mutations/globalTodos/useAssignGlobalTodo', () => ({
  useAssignGlobalTodo: () => ({
    assignGlobalTodo: vi.fn(),
    isAssigningGlobalTodo: false,
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { accountId: 'test-user' }
  })
}));

const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

describe('GlobalTodos', () => {
  beforeEach(() => {
    mockUseGlobalTodos.mockImplementation(() => ({
      globalTodos: [
        { 
          id: '123', 
          todo: 'Test global todo',
          isCompleted: false,
          createdAt: new Date(),
          imageUrl: '',
          todoMoreContent: '',
        } as TodoItemBase
      ],
      isLoading: false,
      isError: false
    }));
  });

  it('renders drawer trigger button', () => {
    customRender(<GlobalTodos />);
    expect(screen.getByTestId('global-todos-trigger')).toBeInTheDocument();
  });

  it('allows adding new global todo', async () => {
    customRender(<GlobalTodos />);
    
    fireEvent.click(screen.getByTestId('global-todos-trigger'));
    
    const input = screen.getByLabelText('New global task name');
    expect(input).toBeInTheDocument();
    fireEvent.change(input, {
      target: { value: 'Test global todo' },
    });
    
    fireEvent.click(screen.getByText('Add global task'));
    
    await waitFor(() => {
      expect(screen.getByText('Test global todo')).toBeInTheDocument();
    });
  });

 

  it('displays loading state when fetching todos', () => {
    mockUseGlobalTodos.mockImplementationOnce(() => ({
      globalTodos: [],
      isLoading: true,
      isError: false
    }));

    customRender(<GlobalTodos />);
    
    fireEvent.click(screen.getByTestId('global-todos-trigger'));
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
}); 