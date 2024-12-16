import { describe, expect, it } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import { AllTheProviders } from '@/AllTheProviders';
import TodosItemCard from '@/components/shared/Todos/TodosItemCard';
import { TodoItemDetailsGlobalSearch } from '@/types/types';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';

describe('TodosItemCard component', () => {
  it('should have three options: details,edit,delete after click popover trigger', async () => {
    const mockData = {} as TodoItemDetailsGlobalSearch;

    render(
      <AllTheProviders>
        <MemoryRouter>
          <TodosItemCard data={mockData} isGlobalSearch={true} />
        </MemoryRouter>
      </AllTheProviders>
    );

    const popoverTrigger = screen.getByTestId('popover-trigger');

    fireEvent.click(popoverTrigger);

    const detailsButton = await screen.findByRole('link', { name: /Details/i });
    const editButton = await screen.findByRole('button', { name: /Edit/i });
    const deleteButton = await screen.findByRole('button', { name: /Delete/i });

    expect(detailsButton).toBeInTheDocument();
    expect(detailsButton).toHaveTextContent(/Details/i);

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveTextContent(/Edit/i);

    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveTextContent(/Delete/i);
  });

  it('should navigate to the correct route when "Details" is clicked', async () => {
    const mockData = {
      id: '123',
    } as TodoItemDetailsGlobalSearch;

    render(
      <AllTheProviders>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<TodosItemCard data={mockData} isGlobalSearch={true} />} />
            <Route path={ROUTES.todoDetails(':id')} element={<div>Todo Details Page</div>} />
          </Routes>
        </MemoryRouter>
      </AllTheProviders>
    );

    const popoverTrigger = screen.getByTestId('popover-trigger');
    fireEvent.click(popoverTrigger);

    const detailsLink = await screen.findByRole('link', { name: /details/i });
    fireEvent.click(detailsLink);

    expect(screen.getByText('Todo Details Page')).toBeInTheDocument();
  });
});
