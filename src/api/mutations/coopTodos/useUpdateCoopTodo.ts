import { updateCoopTodo } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCoopTodo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isUpdatingCoopTodo,
    isError,
    mutateAsync: updateCoopTodoMutation,
  } = useMutation({
    mutationFn: ({
      todoId,
      todo,
      todoMoreContent,
    }: {
      todoId: string;
      todo: string;
      todoMoreContent?: string;
    }) => updateCoopTodo(todoId, todo, todoMoreContent),
    onSuccess: () => {
      // Invalidate all coop todos queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });

      toast({
        title: "Zadanie zaktualizowane",
        description: "Zadanie zostało pomyślnie zaktualizowane",
      });
    },
    onError: () => {
      toast({
        title: "Błąd aktualizacji zadania",
        description: "Nie udało się zaktualizować zadania. Spróbuj ponownie.",
        variant: "destructive",
      });
    },
  });

  return { isUpdatingCoopTodo, isError, updateCoopTodoMutation };
}
