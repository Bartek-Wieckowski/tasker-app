import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Loader from "../Loader";
import { TodoFormValues, todoFormSchema } from "@/validators/validators";
import { useTranslation } from "react-i18next";

type CoopTodoFormProps = {
  onSubmit: (data: { todo: string; todoMoreContent?: string }) => Promise<void>;
  isSubmitting: boolean;
  onCancel?: () => void;
  initialData?: {
    todo: string;
    todoMoreContent: string;
  };
};

export default function CoopTodoForm({
  onSubmit,
  isSubmitting,
  onCancel,
  initialData,
}: CoopTodoFormProps) {
  const { t } = useTranslation();

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema(t)),
    defaultValues: {
      todo: initialData?.todo || "",
      todo_more_content: initialData?.todoMoreContent || "",
    },
  });

  const handleSubmit = async (data: TodoFormValues) => {
    await onSubmit({
      todo: data.todo,
      todoMoreContent: data.todo_more_content || undefined,
    });

    // Reset form after successful submission
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="todo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.todoContent")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("common.todoContentPlaceholder")}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="todo_more_content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.todoMoreContent")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("common.todoMoreContentPlaceholder")}
                  disabled={isSubmitting}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader />
                {initialData ? t("common.updating") : t("common.adding")}
              </div>
            ) : initialData ? (
              t("common.update")
            ) : (
              t("common.add")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
