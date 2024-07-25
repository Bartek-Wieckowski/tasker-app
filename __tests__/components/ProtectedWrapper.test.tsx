import ProtectedWrapper from '@/components/shared/ProtectedWrapper';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from '@/contexts/AuthContext';
import { render } from '../setup';
import { ROUTES } from '@/routes/constants';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Outlet: () => <div>Outlet</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedWrapper component', () => {
  it('should render Outlet when user is authenticated', () => {
    const mockUseAuth = vi.fn().mockReturnValue({ isAuth: true });
    vi.mocked(useAuth).mockImplementation(mockUseAuth);

    render(
      <MemoryRouter>
        <ProtectedWrapper />
      </MemoryRouter>
    );

    expect(screen.getByText(/outlet/i)).toBeInTheDocument();
  });

  it('should navigate to login page when user is not authenticated', async () => {
    const mockUseAuth = vi.fn().mockReturnValue({ isAuth: false });
    vi.mocked(useAuth).mockImplementation(mockUseAuth);

    render(
      <MemoryRouter>
        <ProtectedWrapper />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.login);
    });
  });
});
