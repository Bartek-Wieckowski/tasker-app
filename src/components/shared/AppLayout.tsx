import { Outlet } from 'react-router-dom';
import Container from './Container';
import Logo from './Logo';
import Header from './Header';
import UserNavigation from './UserNavigation';

const AppLayout = () => {
  const isAuth = false;
  return (
    <section className="flex flex-col justify-center max-w-7xl w-full mx-auto p-2">
      <Container>
        <Header>
          <Logo />
          {!isAuth && <UserNavigation />}
        </Header>
      </Container>
      <Container>
        <Outlet />
      </Container>
    </section>
  );
};

export default AppLayout;
