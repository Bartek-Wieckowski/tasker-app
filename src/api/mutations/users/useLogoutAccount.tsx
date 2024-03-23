import { useMutation } from '@tanstack/react-query';
import { logoutAccount } from '@/api/apiUsers';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';
import { useToast } from '@/components/ui/use-toast';

export function useLogoutAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isPending: isLogouting,
    isError,
    mutateAsync: logoutUser,
  } = useMutation({
    mutationFn: logoutAccount,
    onSuccess: () => {
      navigate(ROUTES.home);
    },
    onError: () => {
      toast({ title: 'Logout failed. Please try again.', variant: 'destructive' });
    },
  });

  return { logoutUser, isLogouting, isError };
}
