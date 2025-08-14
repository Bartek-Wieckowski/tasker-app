import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTodo } from "@/api/apiTodos";
import { TodoUpdateDetails, User } from "@/types/types";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { mutateAsync: updateTodo, isPending: isTodoChanging } = useMutation({
    mutationFn: ({
      todoId,
      todoDetails,
      currentUser,
    }: {
      todoId: string;
      todoDetails: TodoUpdateDetails;
      currentUser: User;
    }) => {
      return editTodo(todoId, todoDetails, currentUser);
    },
    onSuccess: (_, { todoId }) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["todos", todoId] });
      toast({
        title: t("toastMsg.todoUpdated"),
        variant: "default",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("toastMsg.todoUpdateError"),
      });
    },
  });

  return { updateTodo, isTodoChanging };
};
