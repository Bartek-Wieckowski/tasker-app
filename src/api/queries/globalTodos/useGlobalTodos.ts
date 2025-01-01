import { useQuery } from '@tanstack/react-query';
import { getGlobalTodos } from '@/api/apiGlobalTodos';
import { QUERY_KEYS } from '@/api/constants';

export const useGlobalTodos = (userId: string) => {
  const { data: globalTodos = [], isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.globalTodos, userId],
    queryFn: () => getGlobalTodos(userId),
    enabled: !!userId,
  });
  return { globalTodos, isLoading, isError };
};
