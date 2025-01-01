import { editTodo } from '@/api/apiTodos';
import { QUERY_KEYS } from '@/api/constants';
import { useToast } from '@/components/ui/use-toast';
import { TodoItemDetails, User } from '@/types/types';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export function useUpdateTodo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    isPending: isTodoChanging,
    isError,
    mutateAsync: updateTodo,
  } = useMutation({
    mutationFn: ({
      todoId,
      newTodoDetails,
      selectedDate,
      currentUser,
      deleteImage,
    }: {
      todoId: string;
      newTodoDetails: Partial<TodoItemDetails>;
      selectedDate: string;
      currentUser: User;
      deleteImage: boolean;
    }) => editTodo(todoId, newTodoDetails, selectedDate, currentUser, deleteImage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.todos] });
    },
    onError: () => {
      toast({ title: 'Updating todos failed. Please try again.', variant: 'destructive' });
    },
  });
  return { isTodoChanging, isError, updateTodo };
}
