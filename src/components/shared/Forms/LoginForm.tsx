import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LoginFormValues, loginFormSchema } from '@/validators/validators';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoginAccount } from '@/api/mutations/users/useLoginAccount';
import { ROUTES } from '@/routes/constants';
import Loader from '../Loader';
import { GOOGLE_IMG_URL } from '@/lib/constants';
import { useLoginWithGoogle } from '@/api/mutations/users/useLoginWithGoogle';

const LoginForm = () => {
  const { isPending: isLoginUser, loginUser } = useLoginAccount();
  const { isLoadingUseFromGoogle, loginUserWithGoogle } = useLoginWithGoogle();
  console.log(isLoadingUseFromGoogle);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    await loginUser(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSettled: () => {
          form.reset();
        },
      }
    );
  }
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">
            {isLoginUser ? (
              <div className="flex gap-2">
                <Loader />
                Loading...
              </div>
            ) : (
              'Login'
            )}
          </Button>

          <div className="flex flex-col items-start gap-2">
            <p className="text-sm mt-1">
              Don&apos;t have an account?
              <Link to={ROUTES.register} className="text-sm ml-1">
                Sign up
              </Link>
            </p>
            <p className="text-sm mt-1">or</p>
            <Button type="button" variant="outline" className="flex items-center gap-2" onClick={() => loginUserWithGoogle()}>
              {isLoadingUseFromGoogle ? (
                <div className="flex gap-2">
                  <Loader />
                  Loading...
                </div>
              ) : (
                <>
                  <span>Login with </span>
                  <img src={GOOGLE_IMG_URL} width={15} height={15} />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default LoginForm;
