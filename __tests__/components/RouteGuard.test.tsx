import RouteGuard from '@/components/shared/RouteGuard';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from '@/contexts/AuthContext';
import { render } from '../setup';
import { ROUTES } from '@/routes/constants';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate">Navigating to {to}</div>
  ),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockAuthContext = {
  currentUser: {
    accountId: '',
    username: '',
    email: '',
    imageUrl: '',
    providerId: '',
  },
  setCurrentUser: vi.fn(),
  selectedDate: '',
  setSelectedDate: vi.fn(),
};

describe('RouteGuard component', () => {
  it('should show loader when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthContext,
      isAuth: false,
      isLoading: true,
    });

    render(
      <MemoryRouter>
        <RouteGuard />
      </MemoryRouter>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  describe('Public Routes (requireAuth = false)', () => {
    it('should render outlet for non-authenticated users', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        isAuth: false,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <RouteGuard />
        </MemoryRouter>
      );

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('should navigate to home when user is authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        isAuth: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <RouteGuard />
        </MemoryRouter>
      );

      expect(
        screen.getByText(`Navigating to ${ROUTES.home}`)
      ).toBeInTheDocument();
    });
  });

  describe('Protected Routes (requireAuth = true)', () => {
    it('should render outlet for authenticated users', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        isAuth: true,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <RouteGuard requireAuth />
        </MemoryRouter>
      );

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('should navigate to login when user is not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        isAuth: false,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <RouteGuard requireAuth />
        </MemoryRouter>
      );

      expect(
        screen.getByText(`Navigating to ${ROUTES.login}`)
      ).toBeInTheDocument();
    });
  });

  describe('Children prop', () => {
    it('should render children instead of outlet when provided', () => {
      vi.mocked(useAuth).mockReturnValue({
        ...mockAuthContext,
        isAuth: false,
        isLoading: false,
      });

      render(
        <MemoryRouter>
          <RouteGuard>
            <div data-testid="child-content">Child Content</div>
          </RouteGuard>
        </MemoryRouter>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
    });
  });
});
