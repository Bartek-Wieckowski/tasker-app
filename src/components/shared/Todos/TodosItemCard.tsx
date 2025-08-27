import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisVertical, Image } from "lucide-react";
import { ROUTES } from "@/routes/constants";
import { useState } from "react";
import { TodoRow } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  dateCustomFormatting,
  localeMap,
  multiFormatDateString,
} from "@/lib/helpers";
import { useDeleteTodo } from "@/api/mutations/todos/useDeleteTodo";
import Loader from "../Loader";
import TodoForm from "./TodoForm";
import LightboxImage from "../LightboxImage";
import { Calendar } from "@/components/ui/calendar";
import { useRepeatTodo } from "@/api/mutations/todos/useRepeatTodo";
import { useMoveTodo } from "@/api/mutations/todos/useMoveTodo";
import { toast } from "@/components/ui/use-toast";
import { useDelegateTodo } from "@/api/mutations/todos/useDelegateTodo";
import { useTranslation } from "react-i18next";
import { useUpdateTodoStatus } from "@/api/mutations/todos/useUpdateTodoStatus";
import { searchTodos } from "@/api/apiTodos";
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

type TodosItemCardProps = {
  data: TodoRow;
  isGlobalSearch?: boolean;
};

export default function TodosItemCard({
  data,
  isGlobalSearch,
}: TodosItemCardProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isStatusChanging, updateStatusTodo } = useUpdateTodoStatus();
  const { isDeletingItemTodo, removeTodo } = useDeleteTodo();
  const { selectedDate, setSelectedDate, currentUser } = useAuth();
  const { setGlobalSearchResult, searchValueGlobal } = useGlobalSearch();
  const [openLightBoxImage, setOpenLightBoxImage] = useState(false);
  const [repeatDialogOpen, setRepeatDialogOpen] = useState(false);
  const [selectedRepeatDate, setSelectedRepeatDate] = useState<Date>();
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedMoveDate, setSelectedMoveDate] = useState<Date>();
  const { currentLanguage } = useLanguage();
  const { repeatTodoItem, isRepeatingTodo } = useRepeatTodo();
  const { moveTodoItem, isMovingTodo } = useMoveTodo();
  const { delegateTodoItem, isDelegatingTodo } = useDelegateTodo();

  // Use data.image_url for lightbox - this will be updated by global search refresh
  const dataImgToLightBoxImage = [{ src: data.image_url || "" }];

  const handleCheckboxClick = async () => {
    if (isGlobalSearch) {
      try {
        await updateStatusTodo({
          todoId: data.id,
          selectedDate: data.todo_date as string,
          currentUser,
          isCompleted: !data.is_completed,
        });
      } catch (error) {
        console.error("Error during todo status update:", error);
      } finally {
        await updateClickedTodoItem();
      }
    } else {
      updateStatusTodo({
        todoId: data.id,
        selectedDate,
        currentUser,
        isCompleted: !data.is_completed,
      });
    }
  };

  const handleDeleteClick = async () => {
    if (isGlobalSearch) {
      try {
        await removeTodo({
          todoId: data.id,
          selectedDate: data.todo_date as string,
          currentUser,
        });
      } catch (error) {
        console.error("Error while removing todo:", error);
      } finally {
        await updateClickedTodoItem();
      }
    } else {
      await removeTodo({
        todoId: data.id,
        selectedDate,
        currentUser,
      });
    }
  };

  const handleRepeatTodo = async () => {
    if (!selectedRepeatDate) return;

    const newDate = dateCustomFormatting(selectedRepeatDate);

    try {
      await repeatTodoItem({
        todoDetails: data,
        newDate,
        currentUser,
      });

      setRepeatDialogOpen(false);
      setSelectedRepeatDate(undefined);

      if (isGlobalSearch) {
        await updateClickedTodoItem();
      }
    } catch (error) {
      console.error("Error during todo repeat:", error);
    }
  };

  const updateClickedTodoItem = async () => {
    const updatedTodos = await searchTodos(searchValueGlobal, currentUser);
    setGlobalSearchResult(updatedTodos);
  };

  const handleCloseLightbox = () => {
    setOpenLightBoxImage(false);
  };

  const setGlobalDateIfItemSearchGlobally = () => {
    if (isGlobalSearch) {
      setSelectedDate(data.todo_date as string);
    }
  };

  const shortTimeToFinishTask = (
    selectedDate: string,
    isCompleted: boolean
  ) => {
    const currentDate = new Date();
    const currentDateFormat = dateCustomFormatting(currentDate);
    const isToday = currentDateFormat === selectedDate;

    const currentHour = currentDate.getHours();
    const hoursUntilMidnight = 23 - currentHour;
    const lessThanThreeHoursToMidnight = hoursUntilMidnight < 3;
    const lessThanFiveHoursToEvening = hoursUntilMidnight < 5;

    if (!isToday || isCompleted || isGlobalSearch) {
      return "";
    }

    if (lessThanThreeHoursToMidnight) {
      return "bg-rose-200 animate-pulse";
    }

    if (lessThanFiveHoursToEvening) {
      return "bg-yellow-100 animate-pulse";
    }

    return "";
  };

  const handleMoveTodo = async () => {
    if (!selectedMoveDate) return;

    const formattedDate = dateCustomFormatting(selectedMoveDate);
    const originalDate = isGlobalSearch
      ? (data.todo_date as string)
      : selectedDate;

    try {
      if (isGlobalSearch) {
        await moveTodoItem({
          todoId: data.id,
          newDate: formattedDate,
          currentUser,
          originalDate,
        });
        await updateClickedTodoItem();
      } else {
        await moveTodoItem({
          todoId: data.id,
          newDate: formattedDate,
          currentUser,
          originalDate,
        });
      }
      setMoveDialogOpen(false);
      setSelectedMoveDate(undefined);
    } catch (error) {
      toast({
        title: t("toastMsg.todoFailed"),
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "todo-item-card flex justify-between min-h-20 rounded-lg mb-3 p-3 mr-2 bg-white shadow-md",
        shortTimeToFinishTask(
          isGlobalSearch ? (data.todo_date as string) : selectedDate,
          data.is_completed
        )
      )}
    >
      <div className="flex flex-col gap-1 relative justify-center">
        <div className="flex items-center space-x-2 w-full">
          <Switch
            data-testid="checkbox-to-change-status-todo"
            id={data.id}
            checked={data.is_completed}
            onClick={handleCheckboxClick}
            className={cn(
              data.is_completed && "!bg-green-500  !border-green-500"
            )}
          />
          <label
            htmlFor={data.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            data-testid="label-to-change-status-todo"
            onClick={handleCheckboxClick}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  data.is_completed && "line-through text-green-500"
                )}
              >
                {data.todo}
              </div>
              {isStatusChanging && <div className="loaderThreeBars"></div>}
            </div>
          </label>
        </div>
        <small className="text-slate-400">
          {multiFormatDateString(data.created_at)}
        </small>
      </div>
      <Popover>
        <div className="relative flex items-center justify-between space-x-4 pl-4">
          {data.image_url && (
            <Image
              data-testid="todo-item-has-image"
              data-image-url={data.image_url}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 cursor-zoom-in"
              onClick={() => setOpenLightBoxImage(true)}
            />
          )}
          <PopoverTrigger asChild data-testid="popover-trigger">
            <EllipsisVertical className="cursor-pointer" />
          </PopoverTrigger>
        </div>
        <PopoverContent className="space-y-2 w-auto min-w-[15.625rem]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-between w-full gap-2">
              <Button asChild onClick={setGlobalDateIfItemSearchGlobally}>
                <Link to={ROUTES.todoDetails(data.id)}>
                  {t("todosItemCard.options.details")}
                </Link>
              </Button>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">{t("common.edit")}</Button>
                </DialogTrigger>
                <DialogContent className=" overflow-y-auto max-h-screen custom-scrollbar">
                  <DialogHeader>
                    <DialogTitle>{t("common.editTodo")}</DialogTitle>
                  </DialogHeader>
                  <TodoForm
                    action="Update"
                    singleTodoId={data.id}
                    onCloseDialog={() => setDialogOpen(false)}
                    onUpdateSuccess={
                      isGlobalSearch ? updateClickedTodoItem : undefined
                    }
                  />
                </DialogContent>
              </Dialog>

              <Button
                data-testid="delete-todo-button"
                variant="destructive"
                onClick={handleDeleteClick}
              >
                {isDeletingItemTodo ? (
                  <div className="flex gap-2">
                    <Loader />
                    {t("common.deleting")}
                  </div>
                ) : (
                  t("common.delete")
                )}
              </Button>
            </div>
            <small>{t("todosItemCard.options.moreActionsText")}</small>
            <div className="flex justify-between w-full gap-2">
              <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={data.is_completed}
                    title={
                      data.is_completed ? "Cannot move completed todo" : ""
                    }
                  >
                    {t("common.move")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("todosItemCard.moveTodoDate")}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <Calendar
                      mode="single"
                      selected={selectedMoveDate}
                      onSelect={setSelectedMoveDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      locale={localeMap[currentLanguage]}
                      className="flex justify-center"
                    />
                    <Button
                      onClick={handleMoveTodo}
                      disabled={!selectedMoveDate || isMovingTodo}
                      data-testid="move-todo-button"
                    >
                      {isMovingTodo ? (
                        <div className="flex gap-2">
                          <Loader />
                          {t("common.moving")}
                        </div>
                      ) : (
                        t("todosItemCard.confirmMove")
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={repeatDialogOpen}
                onOpenChange={setRepeatDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">{t("common.repeat")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("todosItemCard.repeatTodoDate")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <Calendar
                      mode="single"
                      selected={selectedRepeatDate}
                      onSelect={setSelectedRepeatDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      locale={localeMap[currentLanguage]}
                      className="flex justify-center"
                    />
                    <Button
                      onClick={handleRepeatTodo}
                      disabled={!selectedRepeatDate || isRepeatingTodo}
                      data-testid="repeat-todo-button"
                    >
                      {isRepeatingTodo ? (
                        <div className="flex gap-2">
                          <Loader />
                          {t("common.repeating")}
                        </div>
                      ) : (
                        t("todosItemCard.confirmRepeat")
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={() => {
                  delegateTodoItem({
                    todoId: data.id,
                    selectedDate: isGlobalSearch
                      ? (data.todo_date as string)
                      : selectedDate,
                    currentUser,
                  });
                }}
                disabled={isDelegatingTodo}
              >
                {isDelegatingTodo ? (
                  <div className="flex gap-2">
                    <Loader />
                    {t("common.delegating")}
                  </div>
                ) : (
                  t("common.delegate")
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <LightboxImage
        open={openLightBoxImage}
        onClose={handleCloseLightbox}
        slides={dataImgToLightBoxImage}
      />
    </div>
  );
}
