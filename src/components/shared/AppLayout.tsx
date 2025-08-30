import { Outlet } from "react-router-dom";
import Container from "./Container";
import Logo from "./Logo";
import Header from "./Header";
import UserPanel from "./User/UserPanel";
import GlobalTodos from "./GlobalTodos/GlobalTodos";
import DelegatedTodos from "./DelegatedTodos/DelegatedTodos";
import CyclicTodos from "./CyclicTodos/CyclicTodos";
import CoopTodos from "./CoopTodos/CoopTodos";
import BottomNavigation from "./BottomNavigation";
import { useMobileTabGlobal } from "../../hooks/useMobileTabSync";
import { TodosAdd } from "./Todos/TodosAdd";
import { NotificationProvider } from "../../contexts/NotificationContext";
import NotificationBell from "./NotificationBell";

export default function AppLayout() {
  const { mobileActiveTab, setMobileActiveTab } = useMobileTabGlobal();
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-stone-50">
        {/* Desktop  */}
        <div className="hidden md:block">
          <div className="fixed top-0 left-0 right-0 bg-stone-50 border-b border-gray-200 z-40">
            <div className=" max-w-7xl mx-auto px-4">
              <Header>
                <div className="flex items-center gap-2">
                  <Logo />
                  <NotificationBell />
                </div>
                <div className="flex gap-2 items-center">
                  <CoopTodos />
                  <CyclicTodos />
                  <DelegatedTodos />
                  <GlobalTodos />
                  <UserPanel />
                </div>
              </Header>
            </div>
          </div>

          <div className="fixed top-20 left-0 right-0 bottom-0 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 h-full">
              <div className="flex justify-center h-full">
                <div className="w-full max-w-4xl h-full flex flex-col">
                  <Container data-testid="container">
                    <div className="h-full flex flex-col pt-4">
                      <Outlet />
                    </div>
                  </Container>
                </div>
                <div className="hidden md:block">
                  <TodosAdd />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile  */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-stone-50 border-b border-gray-200 z-40">
          <div className="px-4">
            <Header>
              <div className="flex items-center">
                <Logo />
                <NotificationBell />
              </div>
              <div className="flex gap-2 items-center">
                <CoopTodos />
                <CyclicTodos />
                <DelegatedTodos />
                <GlobalTodos />
              </div>
            </Header>
          </div>
        </div>

        <div className="md:hidden fixed top-16 left-0 right-0 bottom-20 overflow-hidden">
          <div className="px-4 h-full flex flex-col">
            <Container data-testid="container">
              <div className="h-full flex flex-col">
                <Outlet />
              </div>
            </Container>
          </div>
        </div>

        <BottomNavigation
          activeTab={mobileActiveTab}
          onTabChange={setMobileActiveTab}
        />
      </div>
    </NotificationProvider>
  );
}
