import { AllTheProviders } from '@/AllTheProviders';
import TodosResultsGlobally from '@/components/shared/Todos/TodosResultsGlobally';
import { TodoItemDetails } from '@/types/types';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('TodosResultsGlobally component', () => {
  it('should render TodosItemCard for each todo item', async () => {
    const todos = [
      { id: '1', todo: 'Todo 1' },
      { id: '2', todo: 'Todo 2' },
    ] as TodoItemDetails[];

    render(
      <AllTheProviders>
        <TodosResultsGlobally todos={todos} />
      </AllTheProviders>
    );

    for (const todo of todos) {
      const element = await screen.findByText(todo.todo);
      expect(element).toBeInTheDocument();
    }
  });
});
