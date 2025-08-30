import { updateCoopTodo } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useUpdateCoopTodo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isUpdatingCoopTodo,
    isError,
    mutateAsync: updateCoopTodoMutation,
  } = useMutation({
    mutationFn: ({
      todoId,
      todo,
      todoMoreContent,
    }: {
      todoId: string;
      todo: string;
      todoMoreContent?: string;
    }) => updateCoopTodo(todoId, todo, todoMoreContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });

      toast({
        title: t("toastMsg.todoUpdated"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    },
  });

  return { isUpdatingCoopTodo, isError, updateCoopTodoMutation };
}
