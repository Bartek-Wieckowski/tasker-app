import { leaveSharedTable } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useLeaveSharedTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isLeavingSharedTable,
    isError,
    mutateAsync: leaveSharedTableMutation,
  } = useMutation({
    mutationFn: ({
      sharedTableId,
      emailToRemove,
    }: {
      sharedTableId: string;
      emailToRemove?: string;
    }) => leaveSharedTable(sharedTableId, emailToRemove),
    onSuccess: () => {
      // Invalidate shared tables and todos
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodosShared] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });

      toast({
        title: "Opuściłeś tabelę",
        description: "Pomyślnie opuściłeś tabelę współdzielonych zadań",
      });
    },
    onError: () => {
      toast({
        title: "Błąd opuszczania tabeli",
        description: "Nie udało się opuścić tabeli. Spróbuj ponownie.",
        variant: "destructive",
      });
    },
  });

  return { isLeavingSharedTable, isError, leaveSharedTableMutation };
}
