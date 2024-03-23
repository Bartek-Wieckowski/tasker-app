import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSettingsFormPasswordSchema, UserSettingsFormPasswordValues } from '@/validators/validators';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Loader from '../Loader';
import { useChangeSettingsPassword } from '@/api/mutations/users/useChangeSettingsPassword';

const UserSettingsFormPassword = () => {
  const { updateSettingsPassword, isUpdatingPassword } = useChangeSettingsPassword();
  const form = useForm<UserSettingsFormPasswordValues>({
    resolver: zodResolver(userSettingsFormPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  async function onSubmit(values: UserSettingsFormPasswordValues) {
    await updateSettingsPassword(values, {
      onSettled: () => {
        form.reset();
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {isUpdatingPassword ? (
            <div className="flex gap-2">
              <Loader />
              Saving...
            </div>
          ) : (
            'Save new password'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default UserSettingsFormPassword;
