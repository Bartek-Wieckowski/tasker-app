import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignDelegatedTodoToDay } from "@/api/apiDelegatedTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";

export function useAssignDelegatedTodo(accountId: string) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: assignDelegatedTodo, isPending: isAssigningDelegatedTodo } =
    useMutation({
      mutationFn: ({ todoId, date }: { todoId: string; date: Date }) =>
        assignDelegatedTodoToDay(todoId, date, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.delegatedTodos],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.todos],
        });
        toast({ title: t("toastMsg.todoAssign") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.todosFailed"),
          variant: "destructive",
        });
      },
    });

  return { assignDelegatedTodo, isAssigningDelegatedTodo };
}
