import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveTodo } from '@/api/apiTodos';
import { TodoItemDetails, User } from '@/types/types';
import { QUERY_KEYS } from '@/api/constants';
import { useToast } from '@/components/ui/use-toast';

export function useMoveTodo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isMovingTodo,
    isError,
    mutateAsync: moveTodoItem,
  } = useMutation({
    mutationFn: ({
      todoDetails,
      newDate,
      currentUser,
      originalDate,
    }: {
      todoDetails: TodoItemDetails & { todoDate?: string };
      newDate: string;
      currentUser: User;
      originalDate: string;
    }) => moveTodo(todoDetails, newDate, currentUser, originalDate),
    onSuccess: (_, { newDate, originalDate }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos, newDate],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos, originalDate],
      });
      toast({
        title: 'Todo moved successfully',
        description: 'The todo has been moved to the new date.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to move todo',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    moveTodoItem,
    isMovingTodo,
    isError,
  };
}
