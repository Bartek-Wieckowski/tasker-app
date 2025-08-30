import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDelegatedTodo } from "@/api/apiDelegatedTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";

export function useDeleteDelegatedTodo(accountId: string) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    mutate: deleteDelegatedTodoItem,
    isPending: isDeletingDelegatedTodo,
  } = useMutation({
    mutationFn: (todoId: string) => deleteDelegatedTodo(todoId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.delegatedTodos],
      });
      toast({ title: t("toastMsg.todoDeleted") });
    },
    onError: () => {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    },
  });
  return { deleteDelegatedTodoItem, isDeletingDelegatedTodo };
}
