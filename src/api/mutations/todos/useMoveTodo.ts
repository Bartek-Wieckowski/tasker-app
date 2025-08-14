import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveTodo } from "@/api/apiTodos";
import { User } from "@/types/types";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export function useMoveTodo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    isPending: isMovingTodo,
    isError,
    mutateAsync: moveTodoItem,
  } = useMutation({
    mutationFn: ({
      todoId,
      newDate,
      currentUser,
      originalDate,
    }: {
      todoId: string;
      newDate: string;
      currentUser: User;
      originalDate: string;
    }) => {
      return moveTodo(todoId, newDate, currentUser, originalDate);
    },
    onSuccess: (_, { todoId, newDate, originalDate }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos, newDate],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos, originalDate],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos, todoId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos],
      });
      toast({
        title: t("toastMsg.moveTodoTitle"),
        description: t("toastMsg.moveTodoDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.moveTodoFailed"),
        description: t("toastMsg.moveTodoDescription"),
        variant: "destructive",
      });
    },
  });
  return {
    moveTodoItem,
    isMovingTodo,
    isError,
  };
}
