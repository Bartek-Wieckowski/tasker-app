import { updateSharedTable } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useUpdateSharedTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isUpdatingSharedTable,
    isError,
    mutateAsync: updateSharedTableMutation,
  } = useMutation({
    mutationFn: ({
      sharedTableId,
      tableName,
      description,
    }: {
      sharedTableId: string;
      tableName: string;
      description?: string;
    }) => updateSharedTable(sharedTableId, tableName, description),
    onSuccess: () => {
      // Invalidate shared tables
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodosShared] });

      toast({
        title: "Tabela zaktualizowana",
        description: "Nazwa i opis tabeli zostały pomyślnie zaktualizowane",
      });
    },
    onError: () => {
      toast({
        title: "Błąd aktualizacji tabeli",
        description: "Nie udało się zaktualizować tabeli. Spróbuj ponownie.",
        variant: "destructive",
      });
    },
  });

  return { isUpdatingSharedTable, isError, updateSharedTableMutation };
}
