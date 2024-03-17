import { Suspense } from 'react';
import { AllTheProviders } from './AllTheProviders';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import Loader from './components/shared/Loader';

const App = () => {
  return (
    <main className="flex min-h-screen">
      <Suspense fallback={<Loader />}>
        <AllTheProviders>
          <RouterProvider router={router} />
        </AllTheProviders>
      </Suspense>
    </main>
  );
};

export default App;
