import { addTodo } from "@/api/apiTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TodoInsertWithFile, User } from "@/types/types";
import { useTranslation } from "react-i18next";

export function useCreateTodo() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isAddingNewItemTodo,
    isError,
    mutateAsync: createTodo,
  } = useMutation({
    mutationFn: ({
      todoDetails,
      selectedDate,
      currentUser,
    }: {
      todoDetails: TodoInsertWithFile;
      selectedDate: string;
      currentUser: User;
    }) => addTodo(todoDetails, selectedDate, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.todos] });
    },
    onError: () => {
      toast({
        title: t("toastMsg.addingTodosFailed"),
        variant: "destructive",
      });
    },
  });

  return { isAddingNewItemTodo, isError, createTodo };
}
