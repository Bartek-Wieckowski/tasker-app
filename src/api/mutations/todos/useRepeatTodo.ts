import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repeatTodo } from "@/api/apiTodos";
import { TodoRow, User } from "@/types/types";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export function useRepeatTodo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isRepeatingTodo,
    isError,
    mutateAsync: repeatTodoItem,
  } = useMutation({
    mutationFn: ({
      todoDetails,
      newDate,
      currentUser,
    }: {
      todoDetails: TodoRow;
      newDate: string;
      currentUser: User;
    }) => repeatTodo(todoDetails, newDate, currentUser),
    onSuccess: (_, { newDate, todoDetails }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos, newDate],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos, todoDetails.todo_date],
      });

      toast({
        title: t("toastMsg.todoRepeated"),
        description: `${t("toastMsg.todoNewDate")} ${newDate} ${
          todoDetails.image_url ? t("toastMsg.repeatTodoDescriptionImage") : ""
        }`,
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    },
  });

  return {
    repeatTodoItem,
    isRepeatingTodo,
    isError,
  };
}
