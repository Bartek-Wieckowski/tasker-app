import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCoopTodosOrder } from "@/api/apiCoopTodos";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

type UpdateCoopTodosOrderParams = {
  todoOrders: Array<{ id: string; order_index: number }>;
  sharedTableId: string;
};

export const useUpdateCoopTodosOrder = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateCoopTodosOrderMutation,
    isPending: isUpdatingCoopTodosOrder,
  } = useMutation({
    mutationFn: ({ todoOrders, sharedTableId }: UpdateCoopTodosOrderParams) =>
      updateCoopTodosOrder(todoOrders, sharedTableId),
    onSuccess: (_, { sharedTableId }) => {
      // Invalidate coop todos for this shared table
      queryClient.invalidateQueries({
        queryKey: ["coop_todos", sharedTableId],
      });
      // Also invalidate my accessible todos
      queryClient.invalidateQueries({
        queryKey: ["my_accessible_todos"],
      });
    },
    onError: (error: any) => {
      console.error("Error updating coop todos order:", error);
      toast({
        title: t("toastMsg.todoFailed"),
        variant: "destructive",
      });
    },
  });

  return {
    updateCoopTodosOrderMutation,
    isUpdatingCoopTodosOrder,
  };
};
