import TodosTabsList from '@/components/shared/Todos/TodosTabsList';
import { Tabs } from '@/components/ui/tabs';
import { screen, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('TodosTabsList component', () => {
  it('should render tabs with correct names and have 3 items', () => {
    const categorySetHandler = vi.fn();
    render(
      <Tabs>
        <TodosTabsList categorySetHandler={categorySetHandler} />
      </Tabs>
    );

    const tabs = screen.getAllByRole('tab');

    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('All');
    expect(tabs[1]).toHaveTextContent('Completed');
    expect(tabs[2]).toHaveTextContent('Uncompleted');
  });
});
