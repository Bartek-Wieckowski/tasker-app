import { deleteCoopTodo } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useDeleteCoopTodo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isDeletingCoopTodo,
    isError,
    mutateAsync: deleteCoopTodoMutation,
  } = useMutation({
    mutationFn: (todoId: string) => deleteCoopTodo(todoId),
    onSuccess: () => {
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

  return { isDeletingCoopTodo, isError, deleteCoopTodoMutation };
}
