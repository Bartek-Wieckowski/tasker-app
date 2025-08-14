import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTodo, TodoUpdateDetails } from "@/api/apiTodos";
import { User } from "@/types/types";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

type UpdateTodoParams = {
  todoId: string;
  todoDetails: TodoUpdateDetails;
  selectedDate: string;
  currentUser: User;
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { mutateAsync: updateTodo, isPending: isTodoChanging } = useMutation({
    mutationFn: ({
      todoId,
      todoDetails,
      selectedDate,
      currentUser,
    }: UpdateTodoParams) => {
      return editTodo(todoId, todoDetails, selectedDate, currentUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
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
