import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { deleteGlobalTodo } from "@/api/apiGlobalTodos";
import { useTranslation } from "react-i18next";

export const useDeleteGlobalTodo = (accountId: string) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteGlobalTodoItem, isPending: isDeletingGlobalTodo } =
    useMutation({
      mutationFn: (todoId: string) => deleteGlobalTodo(todoId, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.globalTodos] });
        toast({ title: t("toastMsg.globalTodoDeleted") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.globalTodoDeletedFailed"),
          variant: "destructive",
        });
      },
    });
  return {
    deleteGlobalTodo: deleteGlobalTodoItem,
    isDeletingGlobalTodo,
  };
};
