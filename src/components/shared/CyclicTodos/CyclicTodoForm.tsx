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
import {
  cyclicTodoFormSchema,
  CyclicTodoFormValues,
} from "@/validators/validators";
import { useTranslation } from "react-i18next";

type CyclicTodoFormProps = {
  onSubmit: (
    data: CyclicTodoFormValues,
    form: UseFormReturn<CyclicTodoFormValues>
  ) => void;
  isLoading: boolean;
  type: "add" | "edit";
  defaultValues?: CyclicTodoFormValues;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
};

export function CyclicTodoForm({
  onSubmit,
  isLoading,
  type,
  defaultValues,
  inputRef,
}: CyclicTodoFormProps) {
  const { t } = useTranslation();
  const form = useForm<CyclicTodoFormValues>({
    resolver: zodResolver(cyclicTodoFormSchema(t)),
    defaultValues: defaultValues || {
      todo: "",
    },
  });

  const handleSubmit = (data: CyclicTodoFormValues): void => {
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
                      ? "add-cyclic-todo-input"
                      : "edit-cyclic-todo-input"
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
              <FormMessage data-testid="cyclic-todo-form-message" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading}
          data-testid={
            type === "add"
              ? "add-cyclic-todo-button"
              : "edit-cyclic-todo-button"
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
