import { useMutation } from '@tanstack/react-query';
import { logoutAccount } from '@/api/apiUsers';

export function useLogoutAccount() {
  const {
    isPending: isLogouting,
    isError,
    mutateAsync: logoutUser,
  } = useMutation({
    mutationFn: logoutAccount,
  });

  return { logoutUser, isLogouting, isError };
}
