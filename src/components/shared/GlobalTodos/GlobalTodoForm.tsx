import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const formSchema = z.object({
  todo: z.string().min(1, "Task name is required"),
});

type FormData = z.infer<typeof formSchema>;

type GlobalTodoFormProps = {
  onSubmit: (data: FormData, form: UseFormReturn<FormData>) => void;
  isLoading: boolean;
  type: 'add' | 'edit';
  defaultValues?: FormData;
}

export function GlobalTodoForm({ onSubmit, isLoading, type, defaultValues }: GlobalTodoFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      todo: "",
    },
  });

  const handleSubmit = (data: FormData): void => {
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
                {type === 'add' ? 'New global task name' : 'Edit global task name'}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={type === 'add' ? "Write your task name of global list" : "Edit your global todo"} 
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
              {type === 'add' ? 'Adding...' : 'Updating...'}
            </div>
          ) : (
            type === 'add' ? 'Add global task' : 'Update todo'
          )}
        </Button>
      </form>
    </Form>
  );
} 