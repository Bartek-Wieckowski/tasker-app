import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

type TodosSearchTogglerProps = {
  isGlobalSearch: boolean;
  toggleGlobalSearch: () => void;
};

export default function TodosSearchToggler({
  isGlobalSearch,
  toggleGlobalSearch,
}: TodosSearchTogglerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 my-2">
      <Checkbox
        id="globalSearch"
        checked={isGlobalSearch}
        onClick={toggleGlobalSearch}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <label htmlFor="globalSearch">
              <Globe className="cursor-pointer" data-testid="globe-icon" />
            </label>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("todosSearchToggler.searchDescription")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
