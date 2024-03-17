import AppLayout from '@/components/shared/AppLayout';
import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { ROUTES } from './constants';
import Homepage from '@/pages/Homepage';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Todopage from '@/pages/Todopage';
import TodosList from '@/components/shared/Todos/TodosList';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path={ROUTES.register} element={<Register />} />
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.home} element={<Homepage />}>
        <Route index element={<TodosList />} />
        <Route path={ROUTES.todoDetails(':id')} element={<Todopage />} />
      </Route>
    </Route>
  )
);
