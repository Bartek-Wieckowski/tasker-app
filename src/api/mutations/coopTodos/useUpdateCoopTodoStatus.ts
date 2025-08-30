import { updateCoopTodoStatus } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useUpdateCoopTodoStatus() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isUpdatingCoopTodoStatus,
    isError,
    mutateAsync: updateCoopTodoStatusMutation,
  } = useMutation({
    mutationFn: ({
      todoId,
      isCompleted,
    }: {
      todoId: string;
      isCompleted: boolean;
    }) => updateCoopTodoStatus(todoId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });
    },
    onError: () => {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    },
  });

  return { isUpdatingCoopTodoStatus, isError, updateCoopTodoStatusMutation };
}
