import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { GlobalTodoForm } from "./GlobalTodoForm";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localeMap } from "@/lib/helpers";
import { useLanguage } from "@/contexts/LanguageContext";
import { GlobalListIcon } from "../Icons";

export default function GlobalTodos() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<GlobalTodoRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<GlobalTodoUpdate | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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

  useEffect(() => {
    const handleResize = () => {
      if (formContainerRef.current) {
        formContainerRef.current.style.setProperty(
          "bottom",
          `env(safe-area-inset-bottom)`
        );
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

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
          <GlobalListIcon />
        </div>
      </DrawerTrigger>
      <DrawerContent ref={formContainerRef} className="min-h-[70vh]">
        <div className="mx-auto w-full max-w-sm py-3">
          <div className="mb-6">
            <DrawerHeader className="mb-4 text-lg font-semibold">
              <DrawerTitle>
                {t("globalTodos.title")} ({globalTodos?.length || 0})
              </DrawerTitle>
              <DrawerDescription>
                {t("globalTodos.description")}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-2 h-[50vh] overflow-auto custom-scrollbar">
              {isLoading ? (
                <Loader />
              ) : (
                globalTodos?.map((todo: GlobalTodoRow) => (
                  <div
                    key={todo.id}
                    className="global-todo-item flex items-center justify-between rounded-lg border p-3"
                  >
                    <span>{todo.todo}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        data-testid="dropdown-trigger"
                      >
                        <EllipsisVertical className="cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="z-50"
                        side="left"
                        align="start"
                      >
                        <div className="flex flex-col gap-2 p-2">
                          <Button
                            onClick={() => {
                              setSelectedTodo(todo);
                              setIsDialogOpen(true);
                            }}
                          >
                            {t("common.assignToDay")}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setTodoToEdit(todo);
                              setEditDialogOpen(true);
                            }}
                          >
                            {t("common.edit")}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteGlobalTodo(todo.id)}
                            disabled={isDeletingGlobalTodo}
                          >
                            {isDeletingGlobalTodo ? (
                              <div className="flex gap-2">
                                <Loader />
                                {t("common.deleting")}
                              </div>
                            ) : (
                              t("common.delete")
                            )}
                          </Button>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
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

          <div className={cn("grid items-start gap-4 px-4")}>
            <GlobalTodoForm
              type="add"
              onSubmit={handleAddSubmit}
              isLoading={isCreatingGlobalTodo}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
