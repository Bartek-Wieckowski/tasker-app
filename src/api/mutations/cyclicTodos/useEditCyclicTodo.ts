import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { editCyclicTodo } from "@/api/apiCyclicTodos";
import { useTranslation } from "react-i18next";

export const useEditCyclicTodo = (accountId: string) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: editCyclicTodoItem, isPending: isEditingCyclicTodo } =
    useMutation({
      mutationFn: ({
        todoId,
        newTodoName,
      }: {
        todoId: string;
        newTodoName: string;
      }) => editCyclicTodo(todoId, newTodoName, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cyclicTodos] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.todos] });
        toast({ title: t("toastMsg.cyclicTodoUpdated") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.cyclicTodoUpdatedFailed"),
          variant: "destructive",
        });
      },
    });
  return {
    editCyclicTodoItem,
    isEditingCyclicTodo,
  };
};
