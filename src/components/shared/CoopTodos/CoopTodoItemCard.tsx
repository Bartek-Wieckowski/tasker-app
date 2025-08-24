import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { EllipsisVertical, Edit } from "lucide-react";
import { multiFormatDateString } from "@/lib/helpers";
import Loader from "../Loader";
import { useUpdateCoopTodoStatus } from "@/api/mutations/coopTodos/useUpdateCoopTodoStatus";
import { useDeleteCoopTodo } from "@/api/mutations/coopTodos/useDeleteCoopTodo";

type CoopTodoData = {
  id: string | null;
  todo: string | null;
  todo_more_content: string | null;
  is_completed: boolean | null;
  created_at: string | null;
  creator_email: string | null;
  completed_by_email: string | null;
  completed_at: string | null;
  todo_type: string | null;
};

type CoopTodoItemCardProps = {
  data: CoopTodoData;
  onEdit?: (todo: {
    id: string | null;
    todo: string | null;
    todo_more_content: string | null;
  }) => void;
};

export default function CoopTodoItemCard({
  data,
  onEdit,
}: CoopTodoItemCardProps) {
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const { updateCoopTodoStatusMutation } = useUpdateCoopTodoStatus();
  const { deleteCoopTodoMutation, isDeletingCoopTodo } = useDeleteCoopTodo();

  // Return early if essential data is missing
  if (!data.id || !data.todo) {
    return null;
  }

  const handleCheckboxClick = async () => {
    if (!data.id) return;

    setIsStatusChanging(true);
    try {
      await updateCoopTodoStatusMutation({
        todoId: data.id,
        isCompleted: !data.is_completed,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setIsStatusChanging(false);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!data.id) return;

    if (window.confirm("Czy na pewno chcesz usunąć to zadanie?")) {
      try {
        await deleteCoopTodoMutation(data.id);
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) {
      onEdit({
        id: data.id,
        todo: data.todo,
        todo_more_content: data.todo_more_content,
      });
    }
  };

  return (
    <div
      className={`todo-item-card flex justify-between border border-stone-200 rounded-lg mb-3 p-3 ${
        data.is_completed ? "bg-green-50" : ""
      }`}
    >
      <div className="flex flex-col gap-1 relative flex-1">
        <div className="flex items-center space-x-2 w-full">
          <Checkbox
            id={data.id}
            checked={data.is_completed || false}
            onClick={handleCheckboxClick}
            className={`${
              data.is_completed && "!bg-green-500 !border-green-500"
            }`}
            disabled={isStatusChanging}
          />
          <label
            htmlFor={data.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            onClick={handleCheckboxClick}
          >
            <div className="flex items-center gap-2">
              <div
                className={`${
                  data.is_completed && "line-through text-green-500"
                }`}
              >
                {data.todo}
              </div>
              {isStatusChanging && <div className="loaderThreeBars"></div>}
            </div>
          </label>
        </div>

        {data.todo_more_content && (
          <div className="text-xs text-muted-foreground ml-6">
            {data.todo_more_content}
          </div>
        )}

        <div className="text-xs text-slate-400 ml-6 space-y-1">
          <div>
            Utworzone:{" "}
            {data.created_at
              ? multiFormatDateString(data.created_at)
              : "Nieznana data"}{" "}
            przez {data.creator_email || "Nieznany użytkownik"}
          </div>
          {data.is_completed &&
            data.completed_by_email &&
            data.completed_at && (
              <div>
                Ukończone: {multiFormatDateString(data.completed_at)} przez{" "}
                {data.completed_by_email}
              </div>
            )}
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
              data.todo_type === "own"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {data.todo_type === "own" ? "Twoje" : "Współdzielone"}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={handleEditClick}
            disabled={isDeletingCoopTodo}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edytuj
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleDeleteClick}
            disabled={isDeletingCoopTodo}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            {isDeletingCoopTodo ? (
              <>
                <Loader />
                <span className="ml-2">Usuwanie...</span>
              </>
            ) : (
              "Usuń"
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
