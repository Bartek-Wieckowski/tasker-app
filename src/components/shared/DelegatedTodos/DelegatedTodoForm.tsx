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
import { useTranslation } from "react-i18next";
import {
  delegatedTodoFormSchema,
  DelegatedTodoFormValues,
} from "@/validators/validators";

type DelegatedTodoFormProps = {
  onSubmit: (
    data: DelegatedTodoFormValues,
    form: UseFormReturn<DelegatedTodoFormValues>
  ) => void;
  isLoading: boolean;
  type: "add" | "edit";
  defaultValues?: DelegatedTodoFormValues;
};

export function DelegatedTodoForm({
  onSubmit,
  isLoading,
  type,
  defaultValues,
}: DelegatedTodoFormProps) {
  const { t } = useTranslation();
  const form = useForm<DelegatedTodoFormValues>({
    resolver: zodResolver(delegatedTodoFormSchema(t)),
    defaultValues: defaultValues || {
      todo: "",
    },
  });

  const handleSubmit = (data: DelegatedTodoFormValues): void => {
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
                  ? t("delegatedTodoForm.newDelegatedTaskName")
                  : t("delegatedTodoForm.editDelegatedTaskName")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    type === "add"
                      ? t("delegatedTodoForm.writeYourTaskNameForDelegatedList")
                      : t("delegatedTodoForm.editYourDelegatedTodo")
                  }
                  data-testid={
                    type === "add"
                      ? "add-delegated-todo-input"
                      : "edit-delegated-todo-input"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage data-testid="delegated-todo-form-message" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading}
          data-testid={
            type === "add"
              ? "add-delegated-todo-button"
              : "edit-delegated-todo-button"
          }
        >
          {isLoading ? (
            <div className="flex gap-2">
              <Loader />
              {type === "add" ? t("common.adding") : t("common.updating")}
            </div>
          ) : type === "add" ? (
            t("delegatedTodoForm.addDelegatedTask")
          ) : (
            t("delegatedTodoForm.updateTodo")
          )}
        </Button>
      </form>
    </Form>
  );
}
