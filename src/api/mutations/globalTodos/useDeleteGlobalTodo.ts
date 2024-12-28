import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/api/constants';
import { useToast } from '@/components/ui/use-toast';
import { deleteGlobalTodo } from '@/api/apiGlobalTodos';

export const useDeleteGlobalTodo = (accountId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutateAsync: deleteGlobalTodoItem, isPending: isDeletingGlobalTodo } = useMutation({
    mutationFn: (todoId: string) => deleteGlobalTodo(todoId, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.globalTodos] });
      toast({ title: 'Global Todo deleted successfully' });
    },
    onError: () => {
        toast({ 
          title: 'Deleting global todo failed.',
          description: 'Please try again.',
          variant: 'destructive' 
        });
      },
  });

  return {
    deleteGlobalTodo: deleteGlobalTodoItem,
    isDeletingGlobalTodo,
  };
}; 