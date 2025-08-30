import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userSettingsFormPasswordSchema,
  UserSettingsFormPasswordValues,
} from "@/validators/validators";
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
import Loader from "../Loader";
import { useChangeSettingsPassword } from "@/api/mutations/users/useChangeSettingsPassword";
import { useTranslation } from "react-i18next";

export default function UserSettingsFormPassword() {
  const { updateSettingsPassword, isUpdatingPassword } =
    useChangeSettingsPassword();
  const { t } = useTranslation();

  const form = useForm<UserSettingsFormPasswordValues>({
    resolver: zodResolver(userSettingsFormPasswordSchema(t)),
    defaultValues: {
      password: "",
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
              <FormLabel>{t("userSettingsForm.newPassword")}</FormLabel>
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
              {t("userSettingsForm.saving")}
            </div>
          ) : (
            t("userSettingsForm.saveNewPassword")
          )}
        </Button>
      </form>
    </Form>
  );
}
