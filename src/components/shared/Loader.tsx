import { Loader as LoaderIcon } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center w-full" data-testid="loader">
      <LoaderIcon className="animate-spin" />
    </div>
  );
};

export default Loader;
