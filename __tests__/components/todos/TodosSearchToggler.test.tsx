import { AllTheProviders } from '@/AllTheProviders';
import TodosSearchToggler from '@/components/shared/Todos/TodosSearchToggler';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('TodosSearchToggler component', () => {
  it('should render the checkbox and tooltip correctly', () => {
    const toggleGlobalSearch = vi.fn();
    const isGlobalSearch = false;

    render(
      <AllTheProviders>
        <TodosSearchToggler isGlobalSearch={isGlobalSearch} toggleGlobalSearch={toggleGlobalSearch} />
      </AllTheProviders>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();

    const globeIcon = screen.getByTestId('globe-icon');
    expect(globeIcon).toBeInTheDocument();

    const tooltipText = screen.queryByText(/Check if you want to find task globally/i);
    expect(tooltipText).not.toBeInTheDocument();
  });

  it('should call toggleGlobalSearch when checkbox is clicked', () => {
    const toggleGlobalSearch = vi.fn();
    const isGlobalSearch = false;

    render(
      <AllTheProviders>
        <TodosSearchToggler isGlobalSearch={isGlobalSearch} toggleGlobalSearch={toggleGlobalSearch} />
      </AllTheProviders>
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(toggleGlobalSearch).toHaveBeenCalledTimes(1);
  });
});
