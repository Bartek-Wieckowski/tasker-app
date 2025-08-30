import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCyclicTodosOrder } from "@/api/apiCyclicTodos";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

type UpdateCyclicTodosOrderParams = {
  todoOrders: Array<{ id: string; order_index: number }>;
  userId: string;
};

export const useUpdateCyclicTodosOrder = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateCyclicTodosOrderMutation,
    isPending: isUpdatingCyclicTodosOrder,
  } = useMutation({
    mutationFn: ({ todoOrders, userId }: UpdateCyclicTodosOrderParams) =>
      updateCyclicTodosOrder(todoOrders, userId),
    onSuccess: (_, { userId }) => {
      // Invalidate cyclic todos
      queryClient.invalidateQueries({
        queryKey: ["cyclic_todos", userId],
      });
    },
    onError: (error: any) => {
      console.error("Error updating cyclic todos order:", error);
      toast({
        title: t("toastMsg.todoFailed"),
        variant: "destructive",
      });
    },
  });

  return {
    updateCyclicTodosOrderMutation,
    isUpdatingCyclicTodosOrder,
  };
};
