import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import {
  globalTodoFormSchema,
  GlobalTodoFormValues,
} from "@/validators/validators";
import { useTranslation } from "react-i18next";

type GlobalTodoFormProps = {
  onSubmit: (
    data: GlobalTodoFormValues,
    form: UseFormReturn<GlobalTodoFormValues>
  ) => void;
  isLoading: boolean;
  type: "add" | "edit";
  defaultValues?: GlobalTodoFormValues;
};

export function GlobalTodoForm({
  onSubmit,
  isLoading,
  type,
  defaultValues,
}: GlobalTodoFormProps) {
  const { t } = useTranslation();
  const form = useForm<GlobalTodoFormValues>({
    resolver: zodResolver(globalTodoFormSchema(t)),
    defaultValues: defaultValues || {
      todo: "",
    },
  });

  const handleSubmit = (data: GlobalTodoFormValues): void => {
    onSubmit(data, form);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="todo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {type === "add"
                  ? t("globalTodoForm.newGlobalTaskName")
                  : t("globalTodoForm.editGlobalTaskName")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    type === "add"
                      ? t("globalTodoForm.writeYourTaskNameForGlobalList")
                      : t("globalTodoForm.editYourGlobalTodo")
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex gap-2">
              <Loader />
              {type === "add" ? t("common.adding") : t("common.updating")}
            </div>
          ) : type === "add" ? (
            t("globalTodoForm.addGlobalTask")
          ) : (
            t("globalTodoForm.updateTodo")
          )}
        </Button>
      </form>
    </Form>
  );
}
