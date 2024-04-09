import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Globe } from 'lucide-react';

type TodosSearchTogglerProps = {
  isGlobalSearch: boolean;
  toggleGlobalSearch: () => void;
};

const TodosSearchToggler = ({ isGlobalSearch, toggleGlobalSearch }: TodosSearchTogglerProps) => {
  return (
    <div className="flex items-center gap-2 my-2">
      <Checkbox id="globalSearch" checked={isGlobalSearch} onClick={toggleGlobalSearch} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <label htmlFor="globalSearch">
              <Globe className="cursor-pointer" />
            </label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Check if you want to find task globally</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TodosSearchToggler;
