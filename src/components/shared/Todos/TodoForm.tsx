import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTodo } from '@/api/mutations/todos/useCreateTodo';
import { useTodoById } from '@/api/queries/todos/useTodoById';
import FileUploader from '../FileUploader';
import { TodoFormValues, todoFormSchema } from '@/validators/validators';
import Loader from '../Loader';
import { useUpdateTodo } from '@/api/mutations/todos/useUpdateTodo';
import { Pencil, Trash2, ImagePlus } from 'lucide-react';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { searchInDatabase } from '@/api/apiTodos';
import LightboxImage from '../LightboxImage';

type TodoFormProps = {
  singleTodoId?: string;
  action: 'Create' | 'Update';
  onCloseDialog: () => void;
  globalSearchItemDate?: string;
};

const TodoForm = ({ singleTodoId, action, onCloseDialog, globalSearchItemDate }: TodoFormProps) => {
  const [isOpenCollapsible, setIsOpenCollapsible] = useState(false);
  const [deleteImage, setDeleteImage] = useState(false);
  const [openLightBoxImage, setOpenLightBoxImage] = useState(false);
  const { currentUser, selectedDate } = useAuth();
  const { isAddingNewItemTodo, createTodo } = useCreateTodo();
  const { todo: singleTodoData } = useTodoById(singleTodoId as string, globalSearchItemDate ? globalSearchItemDate : selectedDate, currentUser);
  const { isTodoChanging, updateTodo } = useUpdateTodo();
  const { isGlobalSearch, searchValueGlobal, setGlobalSearchResult } = useGlobalSearch();
  const dataImgToLightBoxImage = [{ src: singleTodoData ? (singleTodoData.imageUrl as string) : '' }];

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      todo: singleTodoData ? singleTodoData.todo : '',
      todoMoreContent: singleTodoData ? singleTodoData.todoMoreContent : '',
    },
  });

  useEffect(() => {
    if (singleTodoData) {
      form.setValue('todo', singleTodoData.todo);
      form.setValue('todoMoreContent', singleTodoData.todoMoreContent);
    }
  }, [singleTodoData, form]);

  useEffect(() => {
    if (openLightBoxImage) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [openLightBoxImage]);

  async function onSubmit(values: TodoFormValues) {
    if (singleTodoData && action === 'Update') {
      if (isGlobalSearch) {
        try {
          await updateTodo({
            todoId: singleTodoId as string,
            newTodoDetails: { todo: values.todo, todoMoreContent: values.todoMoreContent, imageUrl: values.imageUrl },
            selectedDate: globalSearchItemDate as string,
            currentUser,
            deleteImage,
          });
        } catch (error) {
          console.error('Błąd podczas aktualizacji todo:', error);
        } finally {
          updateClickedTodoItem();
        }
      } else {
        await updateTodo({
          todoId: singleTodoId as string,
          newTodoDetails: { todo: values.todo, todoMoreContent: values.todoMoreContent, imageUrl: values.imageUrl },
          selectedDate,
          currentUser,
          deleteImage,
        });
      }
    } else {
      await createTodo({ todoDetails: values, selectedDate, currentUser });
    }
    onCloseDialog();
  }

  const updateClickedTodoItem = async () => {
    const updatedTodos = await searchInDatabase(searchValueGlobal, currentUser);
    setGlobalSearchResult(updatedTodos);
  };

  const handleCloseLightbox = () => {
    setOpenLightBoxImage(false);
  };

  if (!singleTodoData && action === 'Update') {
    return (
      <>
        {/* //TODO: DAC TUTAJ SKELETON? */}
        <Loader />
      </>
    );
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
                <FormLabel>Todo content</FormLabel>
                <FormControl>
                  <Input placeholder="Add your text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="todoMoreContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Todo more content if you need</FormLabel>
                <FormControl>
                  <Textarea className="custom-scrollbar" placeholder="If you need more content of you todo write here!" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {action === 'Update' && singleTodoData?.imageUrl !== '' && !isOpenCollapsible && (
            <div>
              <p className="text-sm font-medium leading-none">Todo image:</p>
              <img
                src={singleTodoData?.imageUrl as string}
                alt=""
                className="h-[125px] object-contain rounded-sm block mx-auto my-4 cursor-zoom-in"
                onClick={() => setOpenLightBoxImage(true)}
              />
              <p className="text-sm font-medium leading-none mb-4">Image actions allowed:</p>
              <div className="flex items-center gap-2">
                <label htmlFor="todoPhotoRemove" className="text-sm font-medium leading-none">
                  <Trash2 className="text-rose-600 cursor-pointer" />
                </label>
                <Checkbox id="todoPhotoRemove" onClick={() => setDeleteImage(!deleteImage)} />
              </div>
            </div>
          )}
          <Collapsible open={isOpenCollapsible} onOpenChange={setIsOpenCollapsible}>
            <div className="flex items-center gap-2">
              <label htmlFor="todoPhoto" className="text-sm font-medium leading-none">
                {action === 'Create' && <ImagePlus className="text-indigo-600" />}
                {action === 'Update' && singleTodoData?.imageUrl === '' && <ImagePlus className="text-indigo-600 cursor-pointer" />}
                {action === 'Update' && singleTodoData?.imageUrl !== '' && !deleteImage && <Pencil className="text-orange-300 cursor-pointer" />}
              </label>
              {(action === 'Create' || (!deleteImage && action === 'Update')) && (
                <CollapsibleTrigger asChild>
                  <Checkbox id="todoPhoto" checked={isOpenCollapsible} />
                </CollapsibleTrigger>
              )}
            </div>
            <CollapsibleContent className="space-y-2">
              {(action === 'Create' || (!deleteImage && action === 'Update')) && (
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUploader fieldChange={field.onChange} mediaUrl={singleTodoData?.imageUrl as string} />
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
                {action === 'Create' && 'Creating...'}
                {action === 'Update' && 'Updating...'}
              </div>
            ) : (
              `${action} Todo Item`
            )}
          </Button>
        </form>
      </Form>
      {action === 'Update' && <LightboxImage open={openLightBoxImage} onClose={handleCloseLightbox} slides={dataImgToLightBoxImage} />}
    </>
  );
};

export default TodoForm;
