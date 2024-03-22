import { useMutation } from '@tanstack/react-query';
import { loginAccount } from '@/api/apiUsers';
import { LoginUser } from '@/types/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';

export function useLoginAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isPending,
    isError,
    mutateAsync: loginUser,
  } = useMutation({
    mutationFn: (user: LoginUser) => loginAccount(user),
    onSuccess: (data) => {
      if ('user' in data) {
        navigate(ROUTES.home);
      }
    },
    onError: () => {
      toast({ title: 'Login failed. Please try again.', variant: 'destructive' });
    },
  });

  return { loginUser, isPending, isError };
}
