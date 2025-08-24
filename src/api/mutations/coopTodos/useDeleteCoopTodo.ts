import { deleteCoopTodo } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useDeleteCoopTodo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isDeletingCoopTodo,
    isError,
    mutateAsync: deleteCoopTodoMutation,
  } = useMutation({
    mutationFn: (todoId: string) => deleteCoopTodo(todoId),
    onSuccess: () => {
      // Invalidate all coop todos queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });

      toast({
        title: "Zadanie usunięte",
        description: "Zadanie zostało pomyślnie usunięte",
      });
    },
    onError: () => {
      toast({
        title: "Błąd usuwania zadania",
        description: "Nie udało się usunąć zadania. Spróbuj ponownie.",
        variant: "destructive",
      });
    },
  });

  return { isDeletingCoopTodo, isError, deleteCoopTodoMutation };
}

