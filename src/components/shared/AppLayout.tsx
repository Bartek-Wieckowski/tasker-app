import { Outlet } from 'react-router-dom';
import Container from './Container';
import Logo from './Logo';
import Header from './Header';
import UserPanel from './User/UserPanel';

const AppLayout = () => {
  return (
    <section className="flex flex-col justify-center max-w-7xl w-full mx-auto py-2 px-4">
      <Container data-testid="container">
        <Header>
          <Logo />
          <UserPanel />
        </Header>
      </Container>
      <Container data-testid="container">
        <Outlet />
      </Container>
    </section>
  );
};

export default AppLayout;
