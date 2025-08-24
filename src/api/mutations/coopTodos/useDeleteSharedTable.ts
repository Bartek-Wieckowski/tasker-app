import { deleteSharedTable } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export function useDeleteSharedTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isDeletingSharedTable,
    isError,
    mutateAsync: deleteSharedTableMutation,
  } = useMutation({
    mutationFn: (sharedTableId: string) => deleteSharedTable(sharedTableId),
    onSuccess: () => {
      // Invalidate shared tables and todos
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodosShared] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });

      toast({
        title: "Tabela usunięta",
        description: "Tabela i wszystkie zadania zostały pomyślnie usunięte",
      });
    },
    onError: (error: any) => {
      console.error("Delete table mutation error:", error);
      toast({
        title: "Błąd usuwania tabeli",
        description:
          error?.error?.message ||
          "Nie udało się usunąć tabeli. Spróbuj ponownie.",
        variant: "destructive",
      });
    },
  });

  return { isDeletingSharedTable, isError, deleteSharedTableMutation };
}
