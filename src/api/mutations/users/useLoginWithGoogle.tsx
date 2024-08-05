import { useMutation } from '@tanstack/react-query';
import { loginAccountWithGoogle } from '@/api/apiUsers';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';

export function useLoginWithGoogle() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isPending: isLoadingUseFromGoogle,
    isError,
    mutateAsync: loginUserWithGoogle,
  } = useMutation({
    mutationFn: () => loginAccountWithGoogle(),
    onSuccess: () => {
      navigate(ROUTES.home);
    },
    onError: () => {
      toast({ title: 'Login failed. Please try again.', variant: 'destructive' });
    },
  });

  return { loginUserWithGoogle, isLoadingUseFromGoogle, isError };
}
