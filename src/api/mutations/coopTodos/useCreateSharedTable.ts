import { createSharedTodosTable } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useCreateSharedTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isCreatingSharedTable,
    isError,
    mutateAsync: createSharedTableMutation,
  } = useMutation({
    mutationFn: ({
      tableName,
      description,
    }: {
      tableName: string;
      description?: string;
    }) => createSharedTodosTable(tableName, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodosShared] });

      toast({
        title: t("toastMsg.todoAdded"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    },
  });

  return { isCreatingSharedTable, isError, createSharedTableMutation };
}
