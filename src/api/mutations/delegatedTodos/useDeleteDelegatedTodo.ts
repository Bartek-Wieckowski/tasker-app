// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { deleteDelegatedTodo } from '@/api/apiDelegatedTodos';
// import { QUERY_KEYS } from '@/api/constants';

export function useDeleteDelegatedTodo(accountId: string) {
  // const queryClient = useQueryClient();
  // const { mutate: deleteDelegatedTodoItem, isPending: isDeletingDelegatedTodo } =
  //   useMutation({
  //     mutationFn: (todoId: string) => deleteDelegatedTodo(todoId, accountId),
  //     onSuccess: () => {
  //       queryClient.invalidateQueries({
  //         queryKey: [QUERY_KEYS.delegatedTodos],
  //       });
  //     },
  //   });
  // return { deleteDelegatedTodoItem, isDeletingDelegatedTodo };
}
