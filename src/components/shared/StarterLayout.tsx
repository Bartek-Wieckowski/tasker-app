import { Outlet } from "react-router-dom";
import Container from "./Container";
import Logo from "./Logo";
import Header from "./Header";
import UserNavigation from "./User/UserNavigation";

export default function StarterLayout() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center">
      <div className="max-w-lg w-full mx-auto px-4 py-8">
        <Container data-testid="container">
          <Header>
            <Logo />
            <UserNavigation />
          </Header>
        </Container>
        <Container data-testid="container">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
