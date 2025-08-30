import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./routes/constants";
import AllTheProviders from "./AllTheProviders";
import AppLayout from "./components/shared/AppLayout";
import StarterLayout from "./components/shared/StarterLayout";
import AuthProvider from "./contexts/AuthContext";
import Loader from "./components/shared/Loader";
import RouteGuard from "./components/shared/RouteGuard";
import AnimatedRoutes from "./components/shared/AnimatedRoutes";

const Homepage = lazy(() => import("./pages/Homepage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const TodosList = lazy(() => import("./components/shared/Todos/TodosList"));
const Todopage = lazy(() => import("./pages/Todopage"));

export default function App() {
  return (
    <main className="min-h-svh">
      <AllTheProviders>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<Loader />}>
              <AnimatedRoutes y={20} opacity={0.01} duration={0.5}>
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
                        <Route index element={<TodosList />} />
                        <Route
                          path={ROUTES.todoDetails(":id")}
                          element={<Todopage />}
                        />
                      </Route>
                    </Route>
                  </Route>
                </Routes>
              </AnimatedRoutes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </AllTheProviders>
    </main>
  );
}
