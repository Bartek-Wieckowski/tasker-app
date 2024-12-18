import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repeatTodo } from '@/api/apiTodos';
import { TodoItemDetails, User } from '@/types/types';
import { QUERY_KEYS } from '@/api/constants';
import { useToast } from '@/components/ui/use-toast';

export function useRepeatTodo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isRepeatingTodo,
    isError,
    mutateAsync: repeatTodoItem,
  } = useMutation({
    mutationFn: ({
      todoDetails,
      newDate,
      currentUser,
    }: {
      todoDetails: TodoItemDetails & { todoDate?: string };
      newDate: string;
      currentUser: User;
    }) => repeatTodo(todoDetails, newDate, currentUser),
    onSuccess: (_, { newDate }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.todos, newDate],
      });
      toast({
        title: 'Todo repeated successfully',
        description: 'The todo has been copied to the selected date.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to repeat todo',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    repeatTodoItem,
    isRepeatingTodo,
    isError,
  };
}
