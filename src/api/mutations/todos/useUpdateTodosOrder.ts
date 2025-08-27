import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTodosOrder } from "@/api/apiTodos";
import { User } from "@/types/types";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { QUERY_KEYS } from "@/api/constants";

type UpdateTodosOrderParams = {
  todoOrders: Array<{ id: string; order_index: number }>;
  selectedDate: string;
  currentUser: User;
};

export function useUpdateTodosOrder() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateTodosOrderMutation,
    isPending: isUpdatingTodosOrder,
  } = useMutation({
    mutationFn: ({
      todoOrders,
      selectedDate,
      currentUser,
    }: UpdateTodosOrderParams) =>
      updateTodosOrder(todoOrders, selectedDate, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.todos] });
    },
    onError: () => {
      console.error("Error updating todos order:");
      toast({
        title: t("toastMsg.todoFailed"),
        variant: "destructive",
      });
    },
  });

  return {
    updateTodosOrderMutation,
    isUpdatingTodosOrder,
  };
}
