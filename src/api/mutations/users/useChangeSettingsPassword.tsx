import { useMutation } from '@tanstack/react-query';
import { updateUserPassword } from '@/api/apiUsers';
import { useToast } from '@/components/ui/use-toast';
import { UpdateUserPassword } from '@/types/types';

export function useChangeSettingsPassword() {
  const { toast } = useToast();

  const {
    isPending: isUpdatingPassword,
    isError,
    mutateAsync: updateSettingsPassword,
  } = useMutation({
    mutationFn: (userPass: UpdateUserPassword) => updateUserPassword(userPass),
    onSuccess: () => {
      toast({ title: 'Update password success.' });
    },
    onError: () => {
      toast({ title: 'Changing new password failed. Please try again.', variant: 'destructive' });
    },
  });

  return { updateSettingsPassword, isUpdatingPassword, isError };
}
