import { AllTheProviders } from '@/AllTheProviders';
import TodosResultsTab from '@/components/shared/Todos/TodosResultsTab';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TodoItemDetails } from '@/types/types';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('TodosResultsTab component', () => {
  it('should render TodosItemCard for each todo item in the given tab', async () => {
    const todos = [
      { id: '1', todo: 'Todo 1' },
      { id: '2', todo: 'Todo 2' },
    ] as TodoItemDetails[];

    render(
      <AllTheProviders>
        <Tabs value="someTabValue">
          <TabsList>
            <TabsTrigger value="someTabValue">Tab 1</TabsTrigger>
          </TabsList>
          <TodosResultsTab todos={todos} tabValue="someTabValue" />
        </Tabs>
      </AllTheProviders>
    );

    const tab = screen.getByText('Tab 1');
    expect(tab).toBeInTheDocument();

    for (const todo of todos) {
      const element = await screen.findByText(todo.todo);
      expect(element).toBeInTheDocument();
    }
  });
});
