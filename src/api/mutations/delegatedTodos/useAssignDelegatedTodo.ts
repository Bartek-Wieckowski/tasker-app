import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignDelegatedTodoToDay } from '@/api/apiDelegatedTodos';
import { QUERY_KEYS } from '@/api/constants';

export function useAssignDelegatedTodo(accountId: string) {
  const queryClient = useQueryClient();

  const { mutate: assignDelegatedTodo, isPending: isAssigningDelegatedTodo } =
    useMutation({
      mutationFn: ({
        todoId,
        date,
      }: {
        todoId: string;
        date: Date;
      }) => assignDelegatedTodoToDay(todoId, date, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.delegatedTodos],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.todos],
        });
      },
    });

  return { assignDelegatedTodo, isAssigningDelegatedTodo };
} 