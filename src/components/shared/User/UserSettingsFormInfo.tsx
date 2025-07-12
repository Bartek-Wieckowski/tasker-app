import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserSettingsFormInfoValues,
  userSettingsFormInfoSchema,
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
import { useAuth } from "@/contexts/AuthContext";
import { useChangeSettingsAccount } from "@/api/mutations/users/useChangeSettingsAccount";
import Loader from "../Loader";
import FileUploader from "../FileUploader";
import { useTranslation } from "react-i18next";

const UserSettingsFormInfo = () => {
  const { currentUser, isLoading: updatingUser } = useAuth();
  const { isUpdatingSettings, updateSettings } = useChangeSettingsAccount();
  const { t } = useTranslation();

  const form = useForm<UserSettingsFormInfoValues>({
    resolver: zodResolver(userSettingsFormInfoSchema(t)),
    defaultValues: {
      username: currentUser.username || "",
      email: currentUser.email || "",
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
              <FormLabel>{t("userSettingsForm.username")}</FormLabel>
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
              <FormLabel>{t("userSettingsForm.email")}</FormLabel>
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
              <FormLabel>{t("userSettingsForm.addAvatar")}</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={currentUser.imageUrl}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {updatingUser || isUpdatingSettings ? (
            <div className="flex gap-2">
              <Loader />
              {t("userSettingsForm.saving")}
            </div>
          ) : (
            t("userSettingsForm.saveNewProfile")
          )}
        </Button>
      </form>
    </Form>
  );
};

export default UserSettingsFormInfo;
