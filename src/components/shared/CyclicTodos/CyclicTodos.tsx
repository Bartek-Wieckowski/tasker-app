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
import { ListRestart, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { CyclicTodoRow, CyclicTodoUpdate } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import Loader from "@/components/shared/Loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CyclicTodoForm } from "./CyclicTodoForm";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCyclicTodos } from "@/api/queries/cyclicTodos/useCyclicTodos";
import { useAddCyclicTodo } from "@/api/mutations/cyclicTodos/useAddCyclicTodo";
import { useEditCyclicTodo } from "@/api/mutations/cyclicTodos/useEditCyclicTodo";
import { useDeleteCyclicTodo } from "@/api/mutations/cyclicTodos/useDeleteCyclicTodo";

export default function CyclicTodos() {
  const { t } = useTranslation();
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<CyclicTodoUpdate | null>(null);
  const { currentUser } = useAuth();
  const { cyclicTodos, isLoading } = useCyclicTodos(currentUser.accountId);
  const { createCyclicTodo, isCreatingCyclicTodo } = useAddCyclicTodo(
    currentUser.accountId
  );

  const { editCyclicTodoItem, isEditingCyclicTodo } = useEditCyclicTodo(
    currentUser.accountId
  );
  const { deleteCyclicTodo, isDeletingCyclicTodo } = useDeleteCyclicTodo(
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
    createCyclicTodo(data.todo, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const handleEditSubmit = (data: { todo: string }) => {
    if (todoToEdit?.id) {
      editCyclicTodoItem(
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

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <ListRestart
          className="cursor-pointer"
          data-testid="global-todos-trigger"
        />
      </DrawerTrigger>
      <DrawerContent ref={formContainerRef} className="min-h-[70vh]">
        <div className="mx-auto w-full max-w-sm py-3">
          <div className="mb-6">
            <DrawerHeader className="mb-4 text-lg font-semibold">
              <DrawerTitle>
                {t("cyclicTodos.title")} ({cyclicTodos?.length || 0})
              </DrawerTitle>
              <DrawerDescription>
                {t("cyclicTodos.description")}
              </DrawerDescription>
            </DrawerHeader>

            <div className=" space-y-2 h-[50vh] overflow-auto custom-scrollbar">
              {isLoading ? (
                <Loader />
              ) : (
                cyclicTodos?.map((todo: CyclicTodoRow) => (
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
                            variant="outline"
                            onClick={() => {
                              setTodoToEdit(todo);
                              setEditDialogOpen(true);
                            }}
                          >
                            {t("cyclicTodos.edit")}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteCyclicTodo(todo.id)}
                            disabled={isDeletingCyclicTodo}
                          >
                            {isDeletingCyclicTodo ? (
                              <div className="flex gap-2">
                                <Loader />
                                {t("common.deleting")}
                              </div>
                            ) : (
                              t("cyclicTodos.delete")
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
                <DialogTitle>
                  {t("cyclicTodoForm.editYourCyclicTodo")}
                </DialogTitle>
                <DialogDescription />
              </DialogHeader>
              {todoToEdit && (
                <CyclicTodoForm
                  type="edit"
                  onSubmit={handleEditSubmit}
                  isLoading={isEditingCyclicTodo}
                  defaultValues={{
                    todo: todoToEdit.todo || "",
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          <div className={cn("grid items-start gap-4 px-4")}>
            <CyclicTodoForm
              type="add"
              onSubmit={handleAddSubmit}
              isLoading={isCreatingCyclicTodo}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
