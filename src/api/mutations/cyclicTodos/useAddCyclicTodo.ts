import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { addCyclicTodo } from "@/api/apiCyclicTodos";

export const useAddCyclicTodo = (userId: string) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    mutateAsync: createCyclicTodo,
    isPending: isCreatingCyclicTodo,
    isError,
  } = useMutation({
    mutationFn: (title: string) => addCyclicTodo({ todo: title }, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cyclicTodos] });
      toast({ title: t("toastMsg.cyclicTodoAdded") });
    },
    onError: () => {
      toast({
        title: t("toastMsg.cyclicTodoAddedFailed"),
        variant: "destructive",
      });
    },
  });
  return { createCyclicTodo, isCreatingCyclicTodo, isError };
};
