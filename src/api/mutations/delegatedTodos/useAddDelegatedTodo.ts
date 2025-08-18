import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDelegatedTodo } from "@/api/apiDelegatedTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";

export function useAddDelegatedTodo(accountId: string) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: createDelegatedTodo, isPending: isCreatingDelegatedTodo } =
    useMutation({
      mutationFn: (todo: string) => addDelegatedTodo({ todo }, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.delegatedTodos],
        });
        toast({ title: t("toastMsg.delegatedTodoAdded") });
      },
      onError: () => {
        toast({
          title: t("toastMsg.delegatedTodoAddedFailed"),
          variant: "destructive",
        });
      },
    });

  return { createDelegatedTodo, isCreatingDelegatedTodo };
}
