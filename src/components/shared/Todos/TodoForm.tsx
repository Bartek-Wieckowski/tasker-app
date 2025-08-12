import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTodo } from "@/api/mutations/todos/useCreateTodo";
// import { useTodoById } from "@/api/queries/todos/useTodoById";
import FileUploader from "../FileUploader";
import { TodoFormValues, todoFormSchema } from "@/validators/validators";
import { TodoInsertWithFile } from "@/types/types";
import Loader from "../Loader";
// import { useUpdateTodo } from "@/api/mutations/todos/useUpdateTodo";
import { ImagePlus } from "lucide-react";
// import { useGlobalSearch } from "@/contexts/GlobalSearchContext";
// import { searchInDatabase } from "@/api/apiTodos";
// TODO: Dodać LightboxImage gdy będzie funkcja update
import { useTranslation } from "react-i18next";

type TodoFormProps = {
  singleTodoId?: string;
  action: "Create" | "Update";
  onCloseDialog: () => void;
  globalSearchItemDate?: string;
};

const TodoForm = ({
  //   singleTodoId,
  action,
  onCloseDialog,
}: //   globalSearchItemDate,
TodoFormProps) => {
  const [isOpenCollapsible, setIsOpenCollapsible] = useState(false);
  // TODO: Dodać deleteImage gdy będzie funkcja update
  // TODO: Dodać openLightBoxImage gdy będzie funkcja update
  const { currentUser, selectedDate } = useAuth();
  const { isAddingNewItemTodo, createTodo } = useCreateTodo();
  //   const { todo: singleTodoData } = useTodoById(
  //     singleTodoId as string,
  //     globalSearchItemDate ? globalSearchItemDate : selectedDate,
  //     currentUser
  //   );
  //   const { isTodoChanging, updateTodo } = useUpdateTodo();
  //   const { isGlobalSearch, searchValueGlobal, setGlobalSearchResult } =
  //     useGlobalSearch();
  //   const dataImgToLightBoxImage = [
  //     { src: singleTodoData ? (singleTodoData.imageUrl as string) : "" },
  //   ];
  const { t } = useTranslation();

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema(t)),
    defaultValues: {
      todo: "",
      todo_more_content: "",
    },
  });

  //   useEffect(() => {
  //     if (singleTodoData) {
  //       form.setValue("todo", singleTodoData.todo);
  //       form.setValue("todoMoreContent", singleTodoData.todoMoreContent);
  //     }
  //   }, [singleTodoData, form]);

  // TODO: Dodać useEffect dla openLightBoxImage gdy będzie funkcja update

  async function onSubmit(values: TodoFormValues) {
    if (action === "Create") {
      // Mapujemy pola do TodoInsertWithFile - ID zostanie wygenerowane przez Supabase
      const todoDetails: TodoInsertWithFile = {
        todo: values.todo,
        todo_more_content: values.todo_more_content || null,
        imageFile: values.imageFile,
        user_id: currentUser.accountId,
        todo_date: selectedDate,
        is_completed: false,
      };

      await createTodo({ todoDetails, selectedDate, currentUser });
    }
    // TODO: Dodać logikę update gdy będzie potrzebna
    onCloseDialog();
  }

  // TODO: Dodać funkcję updateClickedTodoItem gdy będzie potrzebna

  // TODO: Dodać handleCloseLightbox gdy będzie funkcja update

  //   if (!singleTodoData && action === "Update") {
  //     return (
  //       <>
  //         {/* //TODO: DAC TUTAJ SKELETON? */}
  //         <Loader />
  //       </>
  //     );
  //   }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="todo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("todoForm.todoContent")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("todoForm.todoContentPlaceholder")}
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
                <FormLabel>{t("todoForm.todoMoreContent")}</FormLabel>
                <FormControl>
                  <Textarea
                    className="custom-scrollbar"
                    placeholder={t("todoForm.todoMoreContentPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* TODO: Dodać logikę wyświetlania istniejącego obrazu gdy będzie funkcja update */}
          <Collapsible
            open={isOpenCollapsible}
            onOpenChange={setIsOpenCollapsible}
          >
            <div className="flex items-center gap-2">
              <label
                htmlFor="todoPhoto"
                className="text-sm font-medium leading-none"
              >
                <ImagePlus className="text-indigo-600" />
              </label>
              <CollapsibleTrigger asChild>
                <Checkbox id="todoPhoto" checked={isOpenCollapsible} />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              <FormField
                control={form.control}
                name="imageFile"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUploader fieldChange={field.onChange} mediaUrl="" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>

          <Button type="submit">
            {isAddingNewItemTodo || /*isTodoChanging*/ false ? (
              <div className="flex gap-2">
                <Loader />
                {action === "Create" && t("todoForm.creating")}
                {action === "Update" && t("todoForm.updating")}
              </div>
            ) : (
              `${
                action === "Create"
                  ? t("todoForm.createTodo")
                  : t("todoForm.updateTodo")
              }`
            )}
          </Button>
        </form>
      </Form>
      {/* TODO: Dodać LightboxImage gdy będzie funkcja update */}
    </>
  );
};

export default TodoForm;
