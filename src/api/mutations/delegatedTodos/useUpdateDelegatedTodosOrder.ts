import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDelegatedTodosOrder } from "@/api/apiDelegatedTodos";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

type UpdateDelegatedTodosOrderParams = {
  todoOrders: Array<{ id: string; order_index: number }>;
  userId: string;
};

export const useUpdateDelegatedTodosOrder = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateDelegatedTodosOrderMutation,
    isPending: isUpdatingDelegatedTodosOrder,
  } = useMutation({
    mutationFn: ({ todoOrders, userId }: UpdateDelegatedTodosOrderParams) =>
      updateDelegatedTodosOrder(todoOrders, userId),
    onSuccess: (_, { userId }) => {
      // Invalidate delegated todos
      queryClient.invalidateQueries({
        queryKey: ["delegated_todos", userId],
      });
    },
    onError: (error: any) => {
      console.error("Error updating delegated todos order:", error);
      toast({
        title: t("toastMsg.todoFailed"),
        variant: "destructive",
      });
    },
  });

  return {
    updateDelegatedTodosOrderMutation,
    isUpdatingDelegatedTodosOrder,
  };
};
