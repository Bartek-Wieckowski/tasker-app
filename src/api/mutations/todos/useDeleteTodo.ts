import { deleteTodo } from "@/api/apiTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useDeleteTodo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isDeletingItemTodo,
    isError,
    mutateAsync: removeTodo,
  } = useMutation({
    mutationFn: ({
      todoId,
      selectedDate,
      currentUser,
    }: {
      todoId: string;
      selectedDate: string;
      currentUser: User;
    }) => deleteTodo(todoId, selectedDate, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.todos] });
    },
    onError: () => {
      toast({
        title: t("toastMsg.deletingTodosFailed"),
        variant: "destructive",
      });
    },
  });

  return { isDeletingItemTodo, isError, removeTodo };
}
