import { useMutation } from '@tanstack/react-query';
import { deleteAccount } from '@/api/apiUsers';

export function useDeleteAccount() {
  const {
    isPending: isDeleting,
    isError,
    mutateAsync: deleteUser,
  } = useMutation({
    mutationFn: deleteAccount,
  });

  return { deleteUser, isDeleting, isError };
}
