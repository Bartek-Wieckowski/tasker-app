// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { QUERY_KEYS } from '@/api/constants';
// import { useToast } from '@/components/ui/use-toast';
// import { editGlobalTodo } from '@/api/apiGlobalTodos';

export const useEditGlobalTodo = (accountId: string) => {
  // const { toast } = useToast();
  // const queryClient = useQueryClient();
  // const { mutateAsync: editGlobalTodoItem, isPending: isEditingGlobalTodo } = useMutation({
  //   mutationFn: ({ todoId, newTodoName }: {
  //     todoId: string;
  //     newTodoName: string;
  //   }) => editGlobalTodo(todoId, newTodoName, accountId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.globalTodos] });
  //     toast({ title: 'Global todo updated successfully' });
  //   },
  //   onError: () => {
  //     toast({
  //       title: 'Updating global todo failed.',
  //       description: 'Please try again.',
  //       variant: 'destructive'
  //     });
  //   },
  // });
  // return {
  //   editGlobalTodoItem,
  //   isEditingGlobalTodo,
  // };
};
