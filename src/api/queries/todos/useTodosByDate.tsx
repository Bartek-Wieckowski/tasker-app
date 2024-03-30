import { useQuery } from '@tanstack/react-query';
import { User } from '@/types/types';
import { getTodosFromDay } from '@/api/apiTodos';
import { QUERY_KEYS } from '@/api/constants';

export function useTodosByDate(selectedDate: string, currentUser: User) {
  const {
    data: todos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.todos, selectedDate],
    queryFn: () => getTodosFromDay(selectedDate, currentUser),
    enabled: !!selectedDate && !!currentUser,
  });

  return { todos, isLoading, isError };
}
