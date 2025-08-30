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
import { CalendarClock, EllipsisVertical, Trash2, Pencil } from "lucide-react";
import { DelegatedTodoRow } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteDelegatedTodo } from "@/api/mutations/delegatedTodos/useDeleteDelegatedTodo";
import { useTranslation } from "react-i18next";

type DelegatedTodoItemCardProps = {
  data: DelegatedTodoRow;
  onEdit?: (todo: DelegatedTodoRow) => void;
  onAssign?: (todo: DelegatedTodoRow) => void;
};

export default function DelegatedTodoItemCard({
  data: todo,
  onEdit,
  onAssign,
}: DelegatedTodoItemCardProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const { deleteDelegatedTodoItem, isDeletingDelegatedTodo } =
    useDeleteDelegatedTodo(currentUser.accountId);

  const handleDelete = async () => {
    try {
      await deleteDelegatedTodoItem(todo.id);
    } catch (error) {
      console.error("Error deleting delegated todo:", error);
    }
  };

  return (
    <>
      <div className="delegated-todo-item flex items-center justify-between rounded-lg shadow-md p-3 bg-white min-h-[4.375rem] mr-2">
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
                {onAssign && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="group flex-shrink-0 transition-colors"
                        onClick={() => onAssign(todo)}
                        data-testid="assign-delegated-todo-button-icon"
                      >
                        <CalendarClock className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("common.assignToDay")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="group flex-shrink-0 transition-colors"
                        onClick={() => onEdit(todo)}
                        data-testid="edit-delegated-todo-button-icon"
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
                      disabled={isDeletingDelegatedTodo}
                      data-testid="delete-delegated-todo-button-icon"
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
