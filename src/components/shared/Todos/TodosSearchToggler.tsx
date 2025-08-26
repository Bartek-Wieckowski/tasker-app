import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";

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
      <Switch
        id="globalSearch"
        checked={isGlobalSearch}
        onClick={toggleGlobalSearch}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label htmlFor="globalSearch">
              <TextSearch
                className="cursor-pointer w-[28px] h-[28px]"
                data-testid="globe-icon"
              />
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
