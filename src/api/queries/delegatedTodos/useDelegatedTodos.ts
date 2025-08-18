import { useQuery } from "@tanstack/react-query";
import { getDelegatedTodos } from "@/api/apiDelegatedTodos";
import { QUERY_KEYS } from "@/api/constants";

export function useDelegatedTodos(accountId: string) {
  const {
    data: delegatedTodos,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.delegatedTodos, accountId],
    queryFn: () => getDelegatedTodos(accountId),
    enabled: Boolean(accountId),
  });

  return { delegatedTodos, isLoading, error };
}
