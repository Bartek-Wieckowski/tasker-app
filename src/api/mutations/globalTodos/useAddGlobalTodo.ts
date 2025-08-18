import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGlobalTodo } from "@/api/apiGlobalTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export const useAddGlobalTodo = (userId: string) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    mutateAsync: createGlobalTodo,
    isPending: isCreatingGlobalTodo,
    isError,
  } = useMutation({
    mutationFn: (title: string) => addGlobalTodo({ todo: title }, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.globalTodos] });
      toast({ title: t("toastMsg.globalTodoAdded") });
    },
    onError: () => {
      toast({
        title: t("toastMsg.globalTodoAddedFailed"),
        variant: "destructive",
      });
    },
  });
  return { createGlobalTodo, isCreatingGlobalTodo, isError };
};
