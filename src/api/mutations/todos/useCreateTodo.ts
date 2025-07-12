// import { addTodo } from '@/api/apiTodos';
// import { QUERY_KEYS } from '@/api/constants';
// import { useToast } from '@/components/ui/use-toast';
// import { TodoItem, User } from '@/types/types';
// import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateTodo() {
  // const { toast } = useToast();
  // const queryClient = useQueryClient();
  // const {
  //   isPending: isAddingNewItemTodo,
  //   isError,
  //   mutateAsync: createTodo,
  // } = useMutation({
  //   mutationFn: ({ todoDetails, selectedDate, currentUser }: { todoDetails: TodoItem; selectedDate: string; currentUser: User }) => addTodo(todoDetails, selectedDate, currentUser),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.todos]});
  //   },
  //   onError: () => {
  //     toast({ title: 'Adding todos failed. Please try again.', variant: 'destructive' });
  //   },
  // });
  // return { isAddingNewItemTodo, isError, createTodo };
}
