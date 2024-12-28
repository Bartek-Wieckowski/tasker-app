import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addGlobalTodo } from '@/api/apiGlobalTodos';
import { QUERY_KEYS } from '@/api/constants';
import { useToast } from '@/components/ui/use-toast';

export const useAddGlobalTodo = (userId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    mutateAsync: createGlobalTodo,
    isPending: isCreatingGlobalTodo,
    isError,
  } = useMutation({
    mutationFn: (title: string) => addGlobalTodo({ todo: title }, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.globalTodos] });
      toast({ title: 'Global todo added successfully' });
    },
    onError: () => {
        toast({ 
          title: 'Adding global todo failed.',
          description: 'Please try again.',
          variant: 'destructive' 
        });
      },
    
  });
  return { createGlobalTodo, isCreatingGlobalTodo, isError };
};
