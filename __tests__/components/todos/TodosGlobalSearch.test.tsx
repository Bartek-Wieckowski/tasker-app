import TodosGlobalSearch from '@/components/shared/Todos/TodosGlobalSearch';
import { fireEvent, waitFor, screen, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { User } from '@/types/types';
import { searchInDatabase } from '@/api/apiTodos';

vi.mock('@/api/apiTodos', () => ({
  searchInDatabase: vi.fn(),
}));

vi.mock('@/contexts/GlobalSearchContext', () => ({
  useGlobalSearch: () => ({
    searchValueGlobal: '',
    setSearchValueGlobal: vi.fn(),
    setGlobalSearchResult: vi.fn(),
  }),
}));

describe('TodosGlobalSearch component', () => {
  const mockSearchInDatabase = vi.fn();
  const currentUser: User = {
    accountId: '12345',
    username: 'Test User',
    email: 'test@example.com',
    imageUrl: 'http://example.com/avatar.jpg',
  };

  it('should display error message when search input is empty and search button is triggered', async () => {
    mockSearchInDatabase.mockResolvedValue([]);
    vi.mocked(searchInDatabase).mockImplementation(mockSearchInDatabase);

    render(<TodosGlobalSearch isGlobalSearch={true} currentUser={currentUser} />);

    const inputElement = screen.getByPlaceholderText('Serach task and press button');
    fireEvent.change(inputElement, { target: { value: '' } });

    const buttonElement = screen.getByRole('button');
    fireEvent.click(buttonElement);

    await waitFor(() => {
      const errorMessage = screen.getByText('Nothing of this value was found');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should display search results when search input is provided and search button is clicked', async () => {
    const mockResults = [
      { id: '1', todo: 'Test Todo' },
      { id: '2', todo: 'Another Todo' },
    ];
    mockSearchInDatabase.mockResolvedValue(mockResults);

    render(<TodosGlobalSearch isGlobalSearch={true} currentUser={currentUser} />);

    const inputElement = screen.getByPlaceholderText('Serach task and press button');
    fireEvent.change(inputElement, { target: { value: 'Todo' } });

    const buttonElement = screen.getByRole('button');
    fireEvent.click(buttonElement);

    await waitFor(() => {
      mockResults.forEach(async (result) => {
        const resultElement = await screen.findByText(result.todo);
        expect(resultElement).toBeInTheDocument();
      });
    });
  });
});
