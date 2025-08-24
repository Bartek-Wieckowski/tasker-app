import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { editGlobalTodo } from "@/api/apiGlobalTodos";
import { useTranslation } from "react-i18next";

export function useEditGlobalTodo(accountId: string) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutateAsync: editGlobalTodoItem, isPending: isEditingGlobalTodo } =
    useMutation({
      mutationFn: ({
        todoId,
        newTodoName,
      }: {
        todoId: string;
        newTodoName: string;
      }) => editGlobalTodo(todoId, newTodoName, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.globalTodos] });
        toast({ title: t("toastMsg.todoUpdated") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.todosFailed"),
          variant: "destructive",
        });
      },
    });
  return {
    editGlobalTodoItem,
    isEditingGlobalTodo,
  };
}
