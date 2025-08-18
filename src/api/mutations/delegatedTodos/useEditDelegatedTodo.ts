import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editDelegatedTodo } from "@/api/apiDelegatedTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";

export function useEditDelegatedTodo(accountId: string) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: editDelegatedTodoItem, isPending: isEditingDelegatedTodo } =
    useMutation({
      mutationFn: ({
        todoId,
        newTodoName,
      }: {
        todoId: string;
        newTodoName: string;
      }) => editDelegatedTodo(todoId, newTodoName, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.delegatedTodos],
        });
        toast({ title: t("toastMsg.delegatedTodoUpdated") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.delegatedTodoUpdatedFailed"),
          variant: "destructive",
        });
      },
    });

  return { editDelegatedTodoItem, isEditingDelegatedTodo };
}
