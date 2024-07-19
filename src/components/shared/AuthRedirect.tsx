import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/routes/constants';
import { Navigate } from 'react-router-dom';

const AuthRedirect = ({ element }: { element: React.ReactNode }) => {
  const { isAuth } = useAuth();
  return isAuth ? <Navigate to={ROUTES.home} replace /> : element;
};

export default AuthRedirect;
