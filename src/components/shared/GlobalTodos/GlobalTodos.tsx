import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  CalendarClock,
  EllipsisVertical,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalTodoRow, GlobalTodoUpdate } from "@/types/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import Loader from "@/components/shared/Loader";
import { useGlobalTodos } from "@/api/queries/globalTodos/useGlobalTodos";
import { useAddGlobalTodo } from "@/api/mutations/globalTodos/useAddGlobalTodo";
import { useAssignGlobalTodo } from "@/api/mutations/globalTodos/useAssignGlobalTodo";
import { useEditGlobalTodo } from "@/api/mutations/globalTodos/useEditGlobalTodo";
import { useDeleteGlobalTodo } from "@/api/mutations/globalTodos/useDeleteGlobalTodo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GlobalTodoForm } from "./GlobalTodoForm";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localeMap } from "@/lib/helpers";
import { useLanguage } from "@/contexts/LanguageContext";
import { GlobalListIcon } from "../Icons";
import { useViewportKeyboard } from "@/hooks/useViewportKeyboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function GlobalTodos() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<GlobalTodoRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<GlobalTodoUpdate | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const keyboardHeight = useViewportKeyboard(inputRef);
  const { currentUser } = useAuth();
  const { globalTodos, isLoading } = useGlobalTodos(currentUser.accountId);
  const { createGlobalTodo, isCreatingGlobalTodo } = useAddGlobalTodo(
    currentUser.accountId
  );
  const { assignGlobalTodo, isAssigningGlobalTodo } = useAssignGlobalTodo(
    currentUser.accountId
  );
  const { editGlobalTodoItem, isEditingGlobalTodo } = useEditGlobalTodo(
    currentUser.accountId
  );
  const { deleteGlobalTodo, isDeletingGlobalTodo } = useDeleteGlobalTodo(
    currentUser.accountId
  );

  const handleAddSubmit = (
    data: { todo: string },
    form: UseFormReturn<{ todo: string }>
  ) => {
    createGlobalTodo(data.todo, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const handleEditSubmit = (data: { todo: string }) => {
    if (todoToEdit?.id) {
      editGlobalTodoItem(
        {
          todoId: todoToEdit.id,
          newTodoName: data.todo,
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setTodoToEdit(null);
          },
        }
      );
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !selectedTodo) return;

    setSelectedDate(date);
    assignGlobalTodo(
      {
        todoId: selectedTodo.id,
        date,
      },
      {
        onSuccess: () => {
          setSelectedTodo(null);
          setIsDialogOpen(false);
          setSelectedDate(undefined);
        },
      }
    );
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="cursor-pointer" data-testid="global-todos-trigger">
          <GlobalListIcon size={30} />
        </div>
      </DrawerTrigger>
      <DrawerContent
        ref={formContainerRef}
        className="h-[90svh] bg-stone-50"
        style={{
          paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined,
        }}
      >
        <div className="mx-auto w-full max-w-md h-full relative">
          {/* Header with title and info icon */}
          <DrawerHeader className="absolute top-0 left-0 right-0 pb-4 bg-stone-50 z-10">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold">
                {t("globalTodos.title")} ({globalTodos?.length || 0})
              </DrawerTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-800"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t("globalTodos.description")}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <DrawerDescription className="sr-only">
              {t("globalTodos.description")}
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable content area with calculated height */}
          <div
            className="px-2 overflow-hidden"
            style={{
              height: `calc(90svh - 240px - ${keyboardHeight}px)` /* 240px for header + form */,
              marginTop: "80px" /* space for header */,
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar space-y-2 pr-2 pb-24">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : globalTodos && globalTodos.length > 0 ? (
                globalTodos.map((todo: GlobalTodoRow) => (
                  <div
                    key={todo.id}
                    className="global-todo-item flex items-center justify-between rounded-lg shadow-md p-3 bg-white min-h-[70px] mr-2"
                  >
                    <span className="flex-1 pr-2 break-words">{todo.todo}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        data-testid="dropdown-trigger"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                        >
                          <EllipsisVertical className="cursor-pointer" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="z-50"
                        side="left"
                        align="start"
                      >
                        <div className="flex items-center gap-2 p-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="group flex-shrink-0 transition-colors"
                                  onClick={() => {
                                    setSelectedTodo(todo);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <CalendarClock className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common.assignToDay")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="group flex-shrink-0 transition-colors"
                                  onClick={() => {
                                    setTodoToEdit(todo);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common.edit")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="group flex-shrink-0 transition-colors"
                                  onClick={() => deleteGlobalTodo(todo.id)}
                                  disabled={isDeletingGlobalTodo}
                                >
                                  <Trash2 className="text-red-400 group-hover:text-red-600 transition-colors" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("common.delete")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("common.todosListEmpty")}</p>
                </div>
              )}
            </div>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setTimeout(() => {
                  setSelectedTodo(null);
                  setSelectedDate(undefined);
                }, 0);
              }
              setIsDialogOpen(open);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("common.assignToDayTitle")}</DialogTitle>
                <DialogDescription>
                  {t("common.assignToDayDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      handleDateSelect(date);
                    }
                  }}
                  initialFocus={false}
                  className="rounded-md border"
                  locale={localeMap[currentLanguage]}
                />
              </div>
              {isAssigningGlobalTodo && (
                <div className="flex justify-center">
                  <Loader />
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={editDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setTimeout(() => {
                  setTodoToEdit(null);
                }, 0);
              }
              setEditDialogOpen(open);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("globalTodos.edit")}</DialogTitle>
                <DialogDescription />
              </DialogHeader>
              {todoToEdit && (
                <GlobalTodoForm
                  type="edit"
                  onSubmit={handleEditSubmit}
                  isLoading={isEditingGlobalTodo}
                  defaultValues={{
                    todo: todoToEdit.todo || "",
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Fixed bottom form area */}
          <div className="absolute bottom-1 md:bottom-2 left-0 right-0 bg-white backdrop-blur-sm p-4 rounded-lg shadow-md border-t border-stone-200 z-10">
            <GlobalTodoForm
              type="add"
              onSubmit={handleAddSubmit}
              isLoading={isCreatingGlobalTodo}
              inputRef={inputRef}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
