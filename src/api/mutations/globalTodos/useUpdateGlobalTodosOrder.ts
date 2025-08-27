import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGlobalTodosOrder } from "@/api/apiGlobalTodos";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { QUERY_KEYS } from "@/api/constants";

type UpdateGlobalTodosOrderParams = {
  todoOrders: Array<{ id: string; order_index: number }>;
  userId: string;
};

export function useUpdateGlobalTodosOrder() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateGlobalTodosOrderMutation,
    isPending: isUpdatingGlobalTodosOrder,
  } = useMutation({
    mutationFn: ({ todoOrders, userId }: UpdateGlobalTodosOrderParams) =>
      updateGlobalTodosOrder(todoOrders, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.globalTodos],
      });
    },
    onError: () => {
      console.error("Error updating global todos order:");
      toast({
        title: t("toastMsg.todoFailed"),
        variant: "destructive",
      });
    },
  });

  return {
    updateGlobalTodosOrderMutation,
    isUpdatingGlobalTodosOrder,
  };
}
