import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserSettingsFormInfoValues, userSettingsFormInfoSchema } from '@/validators/validators';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useChangeSettingsAccount } from '@/api/mutations/users/useChangeSettingsAccount';
import Loader from '../Loader';
import FileUploader from '../FileUploader';

const UserSettingsFormInfo = () => {
  const { currentUser, isLoading: updatingUser } = useAuth();
  const { isUpdatingSettings, updateSettings } = useChangeSettingsAccount();

  const form = useForm<UserSettingsFormInfoValues>({
    resolver: zodResolver(userSettingsFormInfoSchema),
    defaultValues: {
      username: currentUser.username || '',
      email: currentUser.email || '',
    },
  });

  async function onSubmit(values: UserSettingsFormInfoValues) {
    await updateSettings(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add Avatar</FormLabel>
              <FormControl>
                <FileUploader fieldChange={field.onChange} mediaUrl={currentUser.imageUrl} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {updatingUser || isUpdatingSettings ? (
            <div className="flex gap-2">
              <Loader />
              Saving...
            </div>
          ) : (
            'Save new profile details'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default UserSettingsFormInfo;
