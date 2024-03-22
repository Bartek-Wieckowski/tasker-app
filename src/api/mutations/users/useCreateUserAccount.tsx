import { NewUser } from '@/types/types';
import { useMutation } from '@tanstack/react-query';
import { createUserAccount } from '@/api/apiUsers';
import { useToast } from '@/components/ui/use-toast';
import { ROUTES } from '@/routes/constants';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function useCreateUserAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentUser } = useAuth();

  const {
    isPending,
    isError,
    mutateAsync: registerUser,
  } = useMutation({
    mutationFn: (user: NewUser) => createUserAccount(user),
    onSuccess: (data) => {
      setCurrentUser(data);
      navigate(ROUTES.home);
    },
    onError: () => {
      toast({ title: 'Register failed. Please try again.', variant: 'destructive' });
    },
  });

  return { registerUser, isPending, isError };
}
