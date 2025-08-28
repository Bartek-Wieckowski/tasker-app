import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EllipsisVertical, Trash2, Pencil } from "lucide-react";
import { CyclicTodoRow } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteCyclicTodo } from "@/api/mutations/cyclicTodos/useDeleteCyclicTodo";
import { useTranslation } from "react-i18next";

type CyclicTodoItemCardProps = {
  data: CyclicTodoRow;
  onEdit?: (todo: CyclicTodoRow) => void;
};

export default function CyclicTodoItemCard({
  data: todo,
  onEdit,
}: CyclicTodoItemCardProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const { deleteCyclicTodo, isDeletingCyclicTodo } = useDeleteCyclicTodo(
    currentUser.accountId
  );

  const handleDelete = async () => {
    try {
      await deleteCyclicTodo(todo.id);
    } catch (error) {
      console.error("Error deleting cyclic todo:", error);
    }
  };

  return (
    <>
      <div className="cyclic-todo-item flex items-center justify-between rounded-lg shadow-md p-3 bg-white min-h-[4.375rem] mr-2">
        <span className="flex-1 pr-2 break-words">{todo.todo}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild data-testid="dropdown-trigger">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
            >
              <EllipsisVertical className="cursor-pointer" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-50" side="left" align="start">
            <div className="flex items-center gap-2 p-2">
              <TooltipProvider>
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="group flex-shrink-0 transition-colors"
                        onClick={() => onEdit(todo)}
                        data-testid="edit-cyclic-todo-button-icon"
                      >
                        <Pencil className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("common.edit")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="group flex-shrink-0 transition-colors"
                      onClick={handleDelete}
                      disabled={isDeletingCyclicTodo}
                      data-testid="delete-cyclic-todo-button-icon"
                    >
                      <Trash2 className="text-red-400 group-hover:text-red-600 transition-colors" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("common.delete")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
