import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignGlobalTodoToDay } from "@/api/apiGlobalTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export const useAssignGlobalTodo = (accountId: string) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: assignGlobalTodo, isPending: isAssigningGlobalTodo } =
    useMutation({
      mutationFn: ({ todoId, date }: { todoId: string; date: Date }) =>
        assignGlobalTodoToDay(todoId, date, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.todos] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.globalTodos] });
        toast({ title: t("toastMsg.globalTodoAssignedToSelectedDate") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.globalTodoAssignedToSelectedDateFailed"),
          variant: "destructive",
        });
      },
    });
  return {
    assignGlobalTodo,
    isAssigningGlobalTodo,
  };
};
