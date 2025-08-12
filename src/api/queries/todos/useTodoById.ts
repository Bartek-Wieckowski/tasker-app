import { useQuery } from "@tanstack/react-query";
import { getTodoById } from "@/api/apiTodos";
import { User } from "@/types/types";
import { QUERY_KEYS } from "@/api/constants";

export const useTodoById = (todoId: string, currentUser: User) => {
  const {
    data: todo,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.todos, todoId],
    queryFn: () => getTodoById(todoId, currentUser),
    enabled: !!todoId,
  });

  return { todo, isLoading, isError };
};
