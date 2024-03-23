import { useMutation } from '@tanstack/react-query';
import { deleteAccount } from '@/api/apiUsers';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ROUTES } from '@/routes/constants';

export function useDeleteAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isPending: isDeleting,
    isError,
    mutateAsync: deleteUser,
  } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      navigate(ROUTES.home);
      toast({ title: 'Delete account success' });
    },
    onError: () => {
      toast({ title: 'Deleting account failed. Please try again.', variant: 'destructive' });
    },
  });

  return { deleteUser, isDeleting, isError };
}
