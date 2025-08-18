import { useState, useEffect } from "react";
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
import { useTodoById } from "@/api/queries/todos/useTodoById";
import FileUploader from "../FileUploader";
import { TodoFormValues, todoFormSchema } from "@/validators/validators";
import { TodoInsertWithFile } from "@/types/types";
import Loader from "../Loader";
import { useUpdateTodo } from "@/api/mutations/todos/useUpdateTodo";
import { ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import LightboxImage from "../LightboxImage";

type TodoFormProps = {
  singleTodoId?: string;
  action: "Create" | "Update";
  onCloseDialog: () => void;
  onUpdateSuccess?: () => void;
};

const TodoForm = ({
  singleTodoId,
  action,
  onCloseDialog,
  onUpdateSuccess,
}: TodoFormProps) => {
  const [isOpenCollapsible, setIsOpenCollapsible] = useState(false);
  const [imageAction, setImageAction] = useState<"keep" | "delete" | "edit">(
    "keep"
  );
  const [openLightBoxImage, setOpenLightBoxImage] = useState(false);
  const { currentUser, selectedDate } = useAuth();
  const { isAddingNewItemTodo, createTodo } = useCreateTodo();
  const { todo: singleTodoData, isLoading: isLoadingTodo } = useTodoById(
    singleTodoId as string,
    currentUser
  );
  const { isTodoChanging, updateTodo } = useUpdateTodo();
  const { t } = useTranslation();

  const dataImgToLightBoxImage = [{ src: singleTodoData?.image_url || "" }];

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema(t)),
    defaultValues: {
      todo: "",
      todo_more_content: "",
    },
  });

  useEffect(() => {
    if (singleTodoData) {
      form.setValue("todo", singleTodoData.todo);
      form.setValue(
        "todo_more_content",
        singleTodoData.todo_more_content || ""
      );
      if (singleTodoData.image_url) {
        setIsOpenCollapsible(true);
      }
    }
  }, [singleTodoData, form]);

  useEffect(() => {
    if (imageAction === "delete" || imageAction === "edit") {
      form.setValue("imageFile", undefined);
    }
  }, [imageAction, form]);

  async function onSubmit(values: TodoFormValues) {
    if (action === "Create") {
      const todoDetails: TodoInsertWithFile = {
        todo: values.todo,
        todo_more_content: values.todo_more_content || null,
        imageFile: values.imageFile,
        user_id: currentUser.accountId,
        todo_date: selectedDate,
        is_completed: false,
      };

      await createTodo({ todoDetails, selectedDate, currentUser });
    } else if (action === "Update" && singleTodoId && singleTodoData) {
      // Build update object with only changed fields
      const todoDetails: Partial<{
        todo: string;
        todo_more_content: string | null;
        imageFile: File | null;
        deleteImage: boolean;
      }> = {};

      // Check if todo text changed
      if (values.todo !== singleTodoData.todo) {
        todoDetails.todo = values.todo;
      }

      // Check if todo_more_content changed
      const originalMoreContent = singleTodoData.todo_more_content || "";
      const newMoreContent = values.todo_more_content || "";
      if (newMoreContent !== originalMoreContent) {
        todoDetails.todo_more_content = values.todo_more_content || null;
      }

      // Handle image changes
      if (
        values.imageFile ||
        imageAction === "delete" ||
        imageAction === "edit"
      ) {
        todoDetails.imageFile = values.imageFile;
        todoDetails.deleteImage = imageAction === "delete";
      }

      await updateTodo({
        todoId: singleTodoId,
        todoDetails,
        currentUser,
      });

      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    }
    onCloseDialog();
  }

  const handleCloseLightbox = () => {
    setOpenLightBoxImage(false);
  };

  if (isLoadingTodo && action === "Update") {
    return <Loader />;
  }

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
                <FormMessage data-testid="todo-form-message" />
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
                <Checkbox
                  id="todoPhoto"
                  checked={isOpenCollapsible}
                  disabled={
                    action === "Update" &&
                    !!singleTodoData?.image_url &&
                    imageAction !== "delete"
                  }
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-4">
              {/* Create new todo - just show uploader */}
              {action === "Create" && (
                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUploader
                          fieldChange={field.onChange}
                          mediaUrl=""
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Update todo with existing image - show options */}
              {action === "Update" && singleTodoData?.image_url && (
                <div className="space-y-4">
                  {/* Image action selector */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                      {t("todoForm.imageOptions")}:
                    </div>

                    {/* Option 1: Keep current image */}
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <input
                        type="radio"
                        id="keep-image"
                        name="imageAction"
                        checked={imageAction === "keep"}
                        onChange={() => setImageAction("keep")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="keep-image"
                          className="font-medium cursor-pointer"
                        >
                          {t("todoForm.keepImage")}
                        </label>
                        {imageAction === "keep" && (
                          <div className="mt-2">
                            <img
                              src={singleTodoData.image_url}
                              alt="Current"
                              className="max-h-24 rounded cursor-pointer"
                              onClick={() => setOpenLightBoxImage(true)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Option 2: Delete image */}
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <input
                        type="radio"
                        id="delete-image"
                        name="imageAction"
                        checked={imageAction === "delete"}
                        onChange={() => setImageAction("delete")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="delete-image"
                          className="font-medium cursor-pointer"
                        >
                          {t("todoForm.deleteImage")}
                        </label>
                        {imageAction === "delete" && (
                          <div className="mt-2 space-y-2">
                            <div className="text-sm text-gray-600">
                              {t("todoForm.imageWillBeDeleted")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Option 3: Edit/Replace image */}
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <input
                        type="radio"
                        id="edit-image"
                        name="imageAction"
                        checked={imageAction === "edit"}
                        onChange={() => setImageAction("edit")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="edit-image"
                          className="font-medium cursor-pointer"
                        >
                          {t("todoForm.replaceImage")}
                        </label>
                        {imageAction === "edit" && (
                          <div className="mt-2 space-y-2">
                            <div className="text-sm text-gray-600">
                              {t("todoForm.currentImage")}:
                            </div>
                            <img
                              src={singleTodoData.image_url}
                              alt="Current"
                              className="max-h-24 rounded cursor-pointer"
                              onClick={() => setOpenLightBoxImage(true)}
                            />
                            <div className="text-sm text-blue-600">
                              {t("todoForm.selectNewImage")}:
                            </div>
                            <FormField
                              control={form.control}
                              name="imageFile"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <FileUploader
                                      fieldChange={field.onChange}
                                      mediaUrl=""
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Update todo without existing image - just show uploader */}
              {action === "Update" && !singleTodoData?.image_url && (
                <FormField
                  control={form.control}
                  name="imageFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUploader
                          fieldChange={field.onChange}
                          mediaUrl=""
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CollapsibleContent>
          </Collapsible>

          <Button type="submit">
            {isAddingNewItemTodo || isTodoChanging ? (
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
      {openLightBoxImage && singleTodoData?.image_url && (
        <LightboxImage
          open={openLightBoxImage}
          slides={dataImgToLightBoxImage}
          onClose={handleCloseLightbox}
        />
      )}
    </>
  );
};

export default TodoForm;
