import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AllTheProviders } from './AllTheProviders';
import { ROUTES } from './routes/constants';
import AppLayout from './components/shared/AppLayout';
import StarterLayout from './components/shared/StarterLayout';
import AuthProvider from './contexts/AuthContext';
import Loader from './components/shared/Loader';
import AuthRedirect from './components/shared/AuthRedirect';
import ProtectedWrapper from './components/shared/ProtectedWrapper';

const Homepage = lazy(() => import('./pages/Homepage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TodosList = lazy(() => import('./components/shared/Todos/TodosList'));
const Todopage = lazy(() => import('./pages/Todopage'));
// const ProtectedWrapper = lazy(() => import('./components/shared/ProtectedWrapper'));
// const AuthRedirect = lazy(() => import('./components/shared/AuthRedirect'));

const App = () => {
  return (
    <main className="flex min-h-screen">
      <Suspense fallback={<Loader />}>
        <AllTheProviders>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<StarterLayout />}>
                  <Route path={ROUTES.register} element={<AuthRedirect element={<Register />} />} />
                  <Route path={ROUTES.login} element={<AuthRedirect element={<Login />} />} />
                </Route>
                <Route element={<ProtectedWrapper />}>
                  <Route element={<AppLayout />}>
                    <Route path={ROUTES.home} element={<Homepage />}>
                      <Route index element={<TodosList />} />
                      <Route path={ROUTES.todoDetails(':id')} element={<Todopage />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
              <Toaster />
            </BrowserRouter>
          </AuthProvider>
        </AllTheProviders>
      </Suspense>
    </main>
  );
};

export default App;
