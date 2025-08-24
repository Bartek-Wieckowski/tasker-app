import { createCoopTodo } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useCreateCoopTodo() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    isPending: isCreatingCoopTodo,
    isError,
    mutateAsync: createCoopTodoMutation,
  } = useMutation({
    mutationFn: ({
      sharedTableId,
      todo,
      todoMoreContent,
    }: {
      sharedTableId: string;
      todo: string;
      todoMoreContent?: string;
    }) => createCoopTodo(sharedTableId, todo, todoMoreContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });
      toast({
        title: t("toastMsg.todoAdded"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    },
  });

  return { isCreatingCoopTodo, isError, createCoopTodoMutation };
}
