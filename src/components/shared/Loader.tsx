import { Loader as LoaderIcon } from "lucide-react";

const Loader = () => {
  return (
    <div
      className="flex flex-col justify-center items-center w-full gap-2"
      data-testid="loader"
    >
      <LoaderIcon className="animate-spin" />
    </div>
  );
};

export default Loader;
