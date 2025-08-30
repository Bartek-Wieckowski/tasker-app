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
  type: "add" | "edit";
  onCancel?: () => void;
  initialData?: {
    todo: string;
    todoMoreContent: string;
  };
};

export default function CoopTodoForm({
  onSubmit,
  isSubmitting,
  type,
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
              <FormLabel>
                {type === "add"
                  ? t("common.newTaskName")
                  : t("common.editTaskName")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    type === "add"
                      ? t("common.writeYourTaskNamePlaceholder")
                      : t("common.editYourTaskPlaceholder")
                  }
                  data-testid={
                    type === "add"
                      ? "add-coop-todo-input"
                      : "edit-coop-todo-input"
                  }
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
              <FormLabel>
                {type === "add"
                  ? t("common.newTaskName")
                  : t("common.editTaskName")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    type === "add"
                      ? t("common.writeYourTaskNamePlaceholder")
                      : t("common.editYourTaskPlaceholder")
                  }
                  data-testid={
                    type === "add"
                      ? "add-coop-todo-more-content-textarea"
                      : "edit-coop-todo-more-content-textarea"
                  }
                  disabled={isSubmitting}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="block">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="mr-2"
            >
              {t("common.cancel")}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid={
              type === "add" ? "add-coop-todo-button" : "edit-coop-todo-button"
            }
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader />
                {type === "add" ? t("common.adding") : t("common.updating")}
              </div>
            ) : type === "add" ? (
              t("common.add")
            ) : (
              t("common.edit")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
