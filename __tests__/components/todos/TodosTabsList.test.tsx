import TodosTabsList from '@/components/shared/Todos/TodosTabsList';
import { Tabs } from '@/components/ui/tabs';
import { TABS_TEXT_1, TABS_TEXT_2, TABS_TEXT_3 } from '@/lib/constants';
import { screen, render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('lucide-react', () => ({
  List: () => <svg data-testid="icon-list" />,
  ListChecks: () => <svg data-testid="icon-list-checks" />,
  ListX: () => <svg data-testid="icon-list-x" />,
}));

describe('TodosTabsList component', () => {
  it('should render tabs with correct names and have 3 items', () => {
    const mockCategorySetHandler = vi.fn();
    render(
      <Tabs>
        <TodosTabsList categorySetHandler={mockCategorySetHandler} />
      </Tabs>
    );

    const tabs = screen.getAllByRole('tab');

    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('All');
    expect(tabs[1]).toHaveTextContent('Completed');
    expect(tabs[2]).toHaveTextContent('Uncompleted');
  });

  it('should render the correct icons for mobile view', () => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));

    const mockCategorySetHandler = vi.fn();
    render(
      <Tabs>
        <TodosTabsList categorySetHandler={mockCategorySetHandler} />
      </Tabs>
    );

    expect(screen.getByTestId('icon-list')).toBeInTheDocument();
    expect(screen.getByTestId('icon-list-checks')).toBeInTheDocument();
    expect(screen.getByTestId('icon-list-x')).toBeInTheDocument();
  });

  it('should call categorySetHandler with the correct value when a tab is clicked', () => {
    window.innerWidth = 800;

    const mockCategorySetHandler = vi.fn();
    render(
      <Tabs>
        <TodosTabsList categorySetHandler={mockCategorySetHandler} />
      </Tabs>
    );

    fireEvent.click(screen.getByText(TABS_TEXT_1));
    expect(mockCategorySetHandler).toHaveBeenCalledWith(TABS_TEXT_1);

    fireEvent.click(screen.getByText(TABS_TEXT_2));
    expect(mockCategorySetHandler).toHaveBeenCalledWith(TABS_TEXT_2);

    fireEvent.click(screen.getByText(TABS_TEXT_3));
    expect(mockCategorySetHandler).toHaveBeenCalledWith(TABS_TEXT_3);
  });
});
