import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EllipsisVertical, Image } from 'lucide-react';
import { ROUTES } from '@/routes/constants';
import { useState } from 'react';
import { TodoItemDetailsGlobalSearch } from '@/types/types';
import { useUpdateTodoStatus } from '@/api/mutations/todos/useUpdateTodoStatus';
import { useAuth } from '@/contexts/AuthContext';
import { dateCustomFormatting, multiFormatDateString } from '@/lib/helpers';
import { useDeleteTodo } from '@/api/mutations/todos/useDeleteTodo';
import { searchInDatabase } from '@/api/apiTodos';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import Loader from '../Loader';
import TodoForm from './TodoForm';
import LightboxImage from '../LightboxImage';

type TodosItemCardProps = {
  data: TodoItemDetailsGlobalSearch;
  isGlobalSearch?: boolean;
};

const TodosItemCard = ({ data, isGlobalSearch }: TodosItemCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isStatusChanging, updateStatusTodo } = useUpdateTodoStatus();
  const { isDeletingItemTodo, removeTodo } = useDeleteTodo();
  const { selectedDate, currentUser, setSelectedDate } = useAuth();
  const { setGlobalSearchResult } = useGlobalSearch();
  const [openLightBoxImage, setOpenLightBoxImage] = useState(false);

  const dataImgToLightBoxImage = [{ src: data.imageUrl as string }];

  const handleCheckboxClick = async () => {
    if (isGlobalSearch) {
      try {
        await updateStatusTodo({
          todoId: data.id,
          selectedDate: data.todoDate as string,
          currentUser,
          isCompleted: !data.isCompleted,
        });
      } catch (error) {
        console.error('Error during todo status update:', error);
      } finally {
        await updateClickedTodoItem();
      }
    } else {
      updateStatusTodo({
        todoId: data.id,
        selectedDate,
        currentUser,
        isCompleted: !data.isCompleted,
      });
    }
  };

  const handleDeleteClick = async () => {
    if (isGlobalSearch) {
      try {
        await removeTodo({
          todoId: data.id,
          selectedDate: data.todoDate as string,
          currentUser,
        });
      } catch (error) {
        console.error('Error while removing todo:', error);
      } finally {
        await updateClickedTodoItem();
      }
    } else {
      removeTodo({
        todoId: data.id,
        selectedDate,
        currentUser,
      });
    }
  };

  const updateClickedTodoItem = async () => {
    const updatedTodos = await searchInDatabase(data.todoSearchValue as string, currentUser);
    setGlobalSearchResult(updatedTodos);
  };

  const handleCloseLightbox = () => {
    setOpenLightBoxImage(false);
  };

  const setGlobalDateIfItemSearchGlobally = () => {
    if (isGlobalSearch) {
      setSelectedDate(data.todoDate as string);
    }
  };

  const shortTimeToFinishTask = async (selectedDate: string, isCompleted: boolean) => {
    const currentDate = new Date();
    const currentDateFormat = dateCustomFormatting(currentDate);
    const isToday = currentDateFormat === selectedDate;
    const hoursUntilMidnight = 24 - currentDate.getHours();
    const lessThanThreeHoursToMidnight = hoursUntilMidnight < 3;
    const lessThanFiveHoursToEvening = hoursUntilMidnight < 5;

    if (lessThanThreeHoursToMidnight) {
      return isToday && !isCompleted && lessThanThreeHoursToMidnight && !isGlobalSearch ? 'bg-rose-200 animate-pulse' : '';
    } else if (lessThanFiveHoursToEvening) {
      return isToday && !isCompleted && lessThanFiveHoursToEvening && !isGlobalSearch ? 'bg-yellow-100 animate-pulse' : '';
    } else {
      return '';
    }
  };

  return (
    <div className={`flex justify-between border border-stone-200 rounded-lg mb-3 p-3 ${shortTimeToFinishTask(selectedDate, data.isCompleted)}`}>
      <div className="flex flex-col gap-1 relative">
        <div className="flex items-center space-x-2 w-full">
          <Checkbox id={data.id} checked={data.isCompleted} onClick={handleCheckboxClick} className={`${data.isCompleted && '!bg-green-500 important !border-green-500'}`} />
          <label
            htmlFor={data.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            onClick={handleCheckboxClick}
          >
            <div className="flex items-center gap-2">
              <div className={`${data.isCompleted && 'line-through text-green-500'}`}>{data.todo}</div>
              {isStatusChanging && <div className="loaderThreeBars"></div>}
            </div>
          </label>
        </div>
        <small className="text-slate-400">{multiFormatDateString(data.createdAt)}</small>
        {data.imageUrl && <Image className="absolute -right-6 -top-1 text-slate-400 w-[12px] h-[12px] cursor-zoom-in" onClick={() => setOpenLightBoxImage(true)} />}
      </div>
      <Popover>
        <div className="flex items-center justify-between space-x-4 px-4">
          <PopoverTrigger asChild data-testid="popover-trigger">
            <EllipsisVertical className="cursor-pointer" />
          </PopoverTrigger>
        </div>
        <PopoverContent className="space-y-2">
          <div className="flex flex-col items-center">
            <div className="flex justify-end gap-2">
              <Button asChild onClick={setGlobalDateIfItemSearchGlobally}>
                <Link to={ROUTES.todoDetails(data.id)}>Details</Link>
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-screen custom-scrollbar">
                  <DialogHeader>
                    <DialogTitle>Edit Todo Item</DialogTitle>
                  </DialogHeader>
                  <TodoForm action="Update" singleTodoId={data.id} onCloseDialog={() => setDialogOpen(false)} globalSearchItemDate={data.todoDate} />
                </DialogContent>
              </Dialog>
              <Button variant="destructive" onClick={handleDeleteClick}>
                {isDeletingItemTodo ? (
                  <div className="flex gap-2">
                    <Loader />
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <LightboxImage open={openLightBoxImage} onClose={handleCloseLightbox} slides={dataImgToLightBoxImage} />
    </div>
  );
};

export default TodosItemCard;
