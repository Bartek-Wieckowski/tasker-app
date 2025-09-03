import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { flushSync } from "react-dom";
import { LoginFormValues, loginFormSchema } from "@/validators/validators";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoginAccount } from "@/api/mutations/users/useLoginAccount";
import { ROUTES } from "@/routes/constants";
import Loader from "../Loader";
import { GOOGLE_IMG_URL } from "@/lib/constants";
import { useLoginWithGoogle } from "@/api/mutations/users/useLoginWithGoogle";
import { useTranslation } from "react-i18next";

export default function LoginForm() {
  const { isPending: isLoginUser, loginUser } = useLoginAccount();
  const { loginUserWithGoogle } = useLoginWithGoogle();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { t } = useTranslation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema(t)),
    defaultValues: {
      email: "",
      password: "",
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

  const handleGoogleLogin = () => {
    flushSync(() => {
      setIsGoogleLoading(true);
    });

    setTimeout(() => {
      loginUserWithGoogle()
        .then(() => {
          if (!import.meta.env.DEV) {
            fetch(import.meta.env.VITE_TASKER_MAIL_SENDER, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: "ktoś-z-googla" }),
            });
          }
        })
        .catch(() => {
          setIsGoogleLoading(false);
        });
    }, 150);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            {isLoginUser ? (
              <div className="flex gap-2">
                <Loader />
                {t("app.loading")}
              </div>
            ) : (
              t("common.login")
            )}
          </Button>

          <div className="flex flex-col items-start gap-2">
            <p className="text-sm mt-1">
              {t("loginPage.dontHaveAccount")}
              <Link to={ROUTES.register} className="text-sm ml-1">
                {t("loginPage.signUp")}
              </Link>
            </p>
            <p className="text-sm mt-1">{t("loginPage.or")}</p>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="flex gap-2">
                  <Loader />
                  {t("app.loading")}
                </div>
              ) : (
                <>
                  <span>{t("loginPage.loginWithGoogle")} </span>
                  <img src={GOOGLE_IMG_URL} width={15} height={15} />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
