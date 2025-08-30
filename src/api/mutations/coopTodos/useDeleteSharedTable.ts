import { deleteSharedTable } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useDeleteSharedTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isDeletingSharedTable,
    isError,
    mutateAsync: deleteSharedTableMutation,
  } = useMutation({
    mutationFn: (sharedTableId: string) => deleteSharedTable(sharedTableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodosShared] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });

      toast({
        title: t("toastMsg.todoDeleted"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    },
  });

  return { isDeletingSharedTable, isError, deleteSharedTableMutation };
}
