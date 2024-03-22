import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/routes/constants';

export default function ProtectedWrapper() {
  const navigate = useNavigate();
  const { isAuth } = useAuth();

  useEffect(() => {
    if (isAuth) {
      navigate(ROUTES.home);
    }
  }, [isAuth, navigate]);
  if (!isAuth) return <Outlet />;
}
