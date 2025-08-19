import { useQuery } from "@tanstack/react-query";
import { getCyclicTodos } from "@/api/apiCyclicTodos";
import { QUERY_KEYS } from "@/api/constants";

export const useCyclicTodos = (userId: string) => {
  const {
    data: cyclicTodos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.cyclicTodos, userId],
    queryFn: () => getCyclicTodos(userId),
    enabled: !!userId,
  });

  return { cyclicTodos, isLoading, isError };
};
