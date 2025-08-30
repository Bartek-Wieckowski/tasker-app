import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RegisterFormValues,
  registerFormSchema,
} from "@/validators/validators";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/constants";
import { useCreateUserAccount } from "@/api/mutations/users/useCreateUserAccount";
import Loader from "../Loader";
import { useTranslation } from "react-i18next";

export default function RegisterForm() {
  const { isPending: isCreatingUser, registerUser } = useCreateUserAccount();
  const { t } = useTranslation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema(t)),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    await registerUser(values, {
      onSettled: () => {
        form.reset();
      },
      onSuccess: () => {
        if (!import.meta.env.DEV) {
          fetch(import.meta.env.VITE_TASKER_MAIL_SENDER, {
            method: "POST",
            body: JSON.stringify(values.email),
          });
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.username")}</FormLabel>
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
              <FormLabel>{t("common.email")}</FormLabel>
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
              <FormLabel>{t("common.password")}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {isCreatingUser ? (
            <div className="flex gap-2">
              <Loader />
              {t("app.loading")}
            </div>
          ) : (
            t("common.register")
          )}
        </Button>
        <p className="text-sm mt-1">
          {t("registerPage.alreadyHaveAccount")}
          <Link to={ROUTES.login} className="text-sm ml-1">
            {t("registerPage.login")}
          </Link>
        </p>
      </form>
    </Form>
  );
}
