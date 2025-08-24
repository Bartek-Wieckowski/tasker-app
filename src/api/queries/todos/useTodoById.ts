import { useQuery } from "@tanstack/react-query";
import { getTodoById } from "@/api/apiTodos";
import { User } from "@/types/types";
import { QUERY_KEYS } from "@/api/constants";

export function useTodoById(todoId: string, currentUser: User) {
  const {
    data: todo,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.todos, todoId],
    queryFn: () => getTodoById(todoId, currentUser),
    enabled: !!todoId,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
  });

  return { todo, isLoading, isError, refetch };
}
