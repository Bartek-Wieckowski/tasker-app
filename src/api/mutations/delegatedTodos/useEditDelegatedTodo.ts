import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editDelegatedTodo } from '@/api/apiDelegatedTodos';
import { QUERY_KEYS } from '@/api/constants';

export function useEditDelegatedTodo(accountId: string) {
  const queryClient = useQueryClient();

  const { mutate: editDelegatedTodoItem, isPending: isEditingDelegatedTodo } =
    useMutation({
      mutationFn: ({
        todoId,
        newTodoName,
      }: {
        todoId: string;
        newTodoName: string;
      }) => editDelegatedTodo(todoId, newTodoName, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.delegatedTodos],
        });
      },
    });

  return { editDelegatedTodoItem, isEditingDelegatedTodo };
} 