import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MutableRefObject } from "react";
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
  inputRef?: MutableRefObject<HTMLInputElement | null>;
};

export function DelegatedTodoForm({
  onSubmit,
  isLoading,
  type,
  defaultValues,
  inputRef,
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
                      ? "add-delegated-todo-input"
                      : "edit-delegated-todo-input"
                  }
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    if (type === "add" && inputRef) {
                      inputRef.current = e;
                    }
                  }}
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
            t("common.add")
          ) : (
            t("common.edit")
          )}
        </Button>
      </form>
    </Form>
  );
}
