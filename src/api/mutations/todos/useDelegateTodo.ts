import { useMutation, useQueryClient } from '@tanstack/react-query';
import { delegateTodo } from '@/api/apiTodos';
import { QUERY_KEYS } from '@/api/constants';
import { User } from '@/types/types';

type DelegateTodoParams = {
  todoId: string;
  selectedDate: string;
  currentUser: User;
};

export function useDelegateTodo() {
  const queryClient = useQueryClient();

  const { mutate: delegateTodoItem, isPending: isDelegatingTodo } = useMutation({
    mutationFn: ({ todoId, selectedDate, currentUser }: DelegateTodoParams) =>
      delegateTodo(todoId, selectedDate, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.delegatedTodos],
      });
    },
  });

  return { delegateTodoItem, isDelegatingTodo };
} 