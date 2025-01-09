import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDelegatedTodo } from '@/api/apiDelegatedTodos';
import { QUERY_KEYS } from '@/api/constants';

export function useAddDelegatedTodo(accountId: string) {
  const queryClient = useQueryClient();

  const { mutate: createDelegatedTodo, isPending: isCreatingDelegatedTodo } =
    useMutation({
      mutationFn: (todo: string) => addDelegatedTodo({ todo }, accountId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.delegatedTodos],
        });
      },
    });

  return { createDelegatedTodo, isCreatingDelegatedTodo };
} 