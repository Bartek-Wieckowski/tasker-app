import { useMutation } from '@tanstack/react-query';
import { updateUserSettings } from '@/api/apiUsers';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateUser } from '@/types/types';

export function useChangeSettingsAccount() {
  const { toast } = useToast();
  const { setCurrentUser } = useAuth();

  const {
    isPending: isUpdatingSettings,
    isError,
    mutateAsync: updateSettings,
  } = useMutation({
    mutationFn: (user: UpdateUser) => updateUserSettings(user),
    onSuccess: (data) => {
      setCurrentUser(data);
      toast({ title: 'Update profile success.' });
    },
    onError: () => {
      toast({ title: 'Updating account failed. Please try again.', variant: 'destructive' });
    },
  });

  return { updateSettings, isUpdatingSettings, isError };
}
