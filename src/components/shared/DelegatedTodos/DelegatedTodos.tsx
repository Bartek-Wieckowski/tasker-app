import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ListRestart, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { DelegatedTodoRow, DelegatedTodoUpdate } from "@/types/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import Loader from "@/components/shared/Loader";
import { useDelegatedTodos } from "@/api/queries/delegatedTodos/useDelegatedTodos";
import { useAddDelegatedTodo } from "@/api/mutations/delegatedTodos/useAddDelegatedTodo";
import { useAssignDelegatedTodo } from "@/api/mutations/delegatedTodos/useAssignDelegatedTodo";
import { useEditDelegatedTodo } from "@/api/mutations/delegatedTodos/useEditDelegatedTodo";
import { useDeleteDelegatedTodo } from "@/api/mutations/delegatedTodos/useDeleteDelegatedTodo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DelegatedTodoForm } from "./DelegatedTodoForm";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { localeMap } from "@/lib/helpers";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DelegatedTodos() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [selectedTodo, setSelectedTodo] = useState<DelegatedTodoRow | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<DelegatedTodoUpdate | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { currentUser } = useAuth();
  const { delegatedTodos, isLoading } = useDelegatedTodos(
    currentUser.accountId
  );
  const { createDelegatedTodo, isCreatingDelegatedTodo } = useAddDelegatedTodo(
    currentUser.accountId
  );
  const { assignDelegatedTodo, isAssigningDelegatedTodo } =
    useAssignDelegatedTodo(currentUser.accountId);
  const { editDelegatedTodoItem, isEditingDelegatedTodo } =
    useEditDelegatedTodo(currentUser.accountId);
  const { deleteDelegatedTodoItem, isDeletingDelegatedTodo } =
    useDeleteDelegatedTodo(currentUser.accountId);

  const handleAddSubmit = (
    data: { todo: string },
    form: UseFormReturn<{ todo: string }>
  ) => {
    createDelegatedTodo(data.todo, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const handleEditSubmit = (data: { todo: string }) => {
    if (todoToEdit?.id) {
      editDelegatedTodoItem(
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
    assignDelegatedTodo(
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
        <ListRestart
          className="cursor-pointer"
          data-testid="delegated-todos-trigger"
        />
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm py-3">
          <div className="mb-6">
            <DrawerHeader className="mb-4 text-lg font-semibold">
              <DrawerTitle>
                {t("delegatedTodos.title")} ({delegatedTodos?.length || 0})
              </DrawerTitle>
              <DrawerDescription>
                {t("delegatedTodos.description")}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-2 h-[50vh] overflow-auto custom-scrollbar">
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  {delegatedTodos?.map((todo: DelegatedTodoRow) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span>{todo.todo}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                              {t("delegatedTodos.assignToDay")}
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
                              onClick={() => deleteDelegatedTodoItem(todo.id)}
                              disabled={isDeletingDelegatedTodo}
                            >
                              {isDeletingDelegatedTodo ? (
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
                  ))}
                </>
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
                <DialogTitle>
                  {t("delegatedTodos.assignToDayTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("delegatedTodos.assignToDayDescription")}
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
              {isAssigningDelegatedTodo && (
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
                <DialogTitle>{t("delegatedTodos.edit")}</DialogTitle>
                <DialogDescription />
              </DialogHeader>
              {todoToEdit && (
                <DelegatedTodoForm
                  type="edit"
                  onSubmit={handleEditSubmit}
                  isLoading={isEditingDelegatedTodo}
                  defaultValues={{
                    todo: todoToEdit.todo || "",
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          <div className={cn("grid items-start gap-4 px-4")}>
            <DelegatedTodoForm
              type="add"
              onSubmit={handleAddSubmit}
              isLoading={isCreatingDelegatedTodo}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
