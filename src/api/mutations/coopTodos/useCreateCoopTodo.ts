import { createCoopTodo } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateCoopTodo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isCreatingCoopTodo,
    isError,
    mutateAsync: createCoopTodoMutation,
  } = useMutation({
    mutationFn: ({
      sharedTableId,
      todo,
      todoMoreContent,
    }: {
      sharedTableId: string;
      todo: string;
      todoMoreContent?: string;
    }) => createCoopTodo(sharedTableId, todo, todoMoreContent),
    onSuccess: () => {
      // Invalidate both all coop todos and specific table todos
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });

      toast({
        title: "Zadanie dodane",
        description: "Nowe zadanie zostało pomyślnie dodane do tabeli",
      });
    },
    onError: () => {
      toast({
        title: "Błąd dodawania zadania",
        description: "Nie udało się dodać zadania. Spróbuj ponownie.",
        variant: "destructive",
      });
    },
  });

  return { isCreatingCoopTodo, isError, createCoopTodoMutation };
}
