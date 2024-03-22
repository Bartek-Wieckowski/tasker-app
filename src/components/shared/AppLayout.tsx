import { Outlet } from 'react-router-dom';
import Container from './Container';
import Logo from './Logo';
import Header from './Header';
import UserNavigation from './UserNavigation';
import { useAuth } from '@/contexts/AuthContext';
import Loader from './Loader';
import UserPanel from './UserPanel';

const AppLayout = () => {
  const { isLoading: isLoadingAuth, isAuth } = useAuth();

  if (isLoadingAuth) {
    return <Loader />;
  }

  return (
    <section className="flex flex-col justify-center max-w-7xl w-full mx-auto p-2">
      <Container>
        <Header>
          <Logo />
          {isAuth ? <UserPanel /> : <UserNavigation />}
        </Header>
      </Container>
      <Container>
        <Outlet />
      </Container>
    </section>
  );
};

export default AppLayout;
