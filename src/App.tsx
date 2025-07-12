import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AllTheProviders } from "./AllTheProviders";
import { ROUTES } from "./routes/constants";
import AppLayout from "./components/shared/AppLayout";
import StarterLayout from "./components/shared/StarterLayout";
import AuthProvider from "./contexts/AuthContext";
import Loader from "./components/shared/Loader";
import RouteGuard from "./components/shared/RouteGuard";

const Homepage = lazy(() => import("./pages/Homepage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
// const TodosList = lazy(() => import("./components/shared/Todos/TodosList"));
// const Todopage = lazy(() => import('./pages/Todopage'));

const App = () => {
  return (
    <main className="flex min-h-screen">
      <AllTheProviders>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route element={<RouteGuard />}>
                  <Route element={<StarterLayout />}>
                    <Route path={ROUTES.register} element={<Register />} />
                    <Route path={ROUTES.login} element={<Login />} />
                  </Route>
                </Route>

                <Route element={<RouteGuard requireAuth />}>
                  <Route element={<AppLayout />}>
                    <Route path={ROUTES.home} element={<Homepage />}>
                      {/* <Route index element={<TodosList />} /> */}
                      {/* <Route path={ROUTES.todoDetails(':id')} element={<Todopage />} /> */}
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </AllTheProviders>
    </main>
  );
};

export default App;
