import { updateTodoCompletionStatus } from "@/api/apiTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useUpdateTodoStatus() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isStatusChanging,
    isError,
    mutateAsync: updateStatusTodo,
  } = useMutation({
    mutationFn: ({
      todoId,
      selectedDate,
      currentUser,
      isCompleted,
    }: {
      todoId: string;
      selectedDate: string;
      currentUser: User;
      isCompleted: boolean;
    }) =>
      updateTodoCompletionStatus(
        todoId,
        selectedDate,
        currentUser,
        isCompleted
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.todos] });
    },
    onError: () => {
      toast({
        title: t("toastMsg.updatingTodosStatusFailed"),
        variant: "destructive",
      });
    },
  });

  return { isStatusChanging, isError, updateStatusTodo };
}
