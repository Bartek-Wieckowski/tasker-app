import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { deleteCyclicTodo } from "@/api/apiCyclicTodos";
import { useTranslation } from "react-i18next";

export function useDeleteCyclicTodo(accountId: string) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutateAsync: deleteCyclicTodoItem, isPending: isDeletingCyclicTodo } =
    useMutation({
      mutationFn: (todoId: string) => deleteCyclicTodo(todoId, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cyclicTodos] });
        toast({ title: t("toastMsg.todoDeleted") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.todosFailed"),
          variant: "destructive",
        });
      },
    });
  return {
    deleteCyclicTodo: deleteCyclicTodoItem,
    isDeletingCyclicTodo,
  };
}
