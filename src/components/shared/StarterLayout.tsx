import { Outlet } from 'react-router-dom';
import Container from './Container';
import Logo from './Logo';
import Header from './Header';
import UserNavigation from './User/UserNavigation';

const StarterLayout = () => {
  return (
    <section className="flex flex-col justify-center max-w-7xl w-full mx-auto p-2">
      <Container data-testid="container">
        <Header>
          <Logo />
          <UserNavigation />
        </Header>
      </Container>
      <Container data-testid="container">
        <Outlet />
      </Container>
    </section>
  );
};

export default StarterLayout;
