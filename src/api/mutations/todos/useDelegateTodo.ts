import { useMutation, useQueryClient } from "@tanstack/react-query";
import { delegateTodo } from "@/api/apiTodos";
import { QUERY_KEYS } from "@/api/constants";
import { User } from "@/types/types";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";

export function useDelegateTodo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: delegateTodoItem, isPending: isDelegatingTodo } = useMutation(
    {
      mutationFn: ({
        todoId,
        selectedDate,
        currentUser,
      }: {
        todoId: string;
        selectedDate: string;
        currentUser: User;
      }) => delegateTodo(todoId, selectedDate, currentUser),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.todos],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.delegatedTodos],
        });
        toast({ title: t("toastMsg.delegateTodoSuccess") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.delegateTodoFailed"),
          variant: "destructive",
        });
      },
    }
  );
  return { delegateTodoItem, isDelegatingTodo };
}
