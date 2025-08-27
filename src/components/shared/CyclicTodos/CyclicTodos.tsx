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
  ListRestart,
  EllipsisVertical,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CyclicTodoForm } from "./CyclicTodoForm";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCyclicTodos } from "@/api/queries/cyclicTodos/useCyclicTodos";
import { useAddCyclicTodo } from "@/api/mutations/cyclicTodos/useAddCyclicTodo";
import { useEditCyclicTodo } from "@/api/mutations/cyclicTodos/useEditCyclicTodo";
import { useDeleteCyclicTodo } from "@/api/mutations/cyclicTodos/useDeleteCyclicTodo";
import { useViewportKeyboard } from "@/hooks/useViewportKeyboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CyclicTodos() {
  const { t } = useTranslation();
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<CyclicTodoUpdate | null>(null);

  const keyboardHeight = useViewportKeyboard(inputRef);
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
        <div className="cursor-pointer" data-testid="cyclic-todos-trigger">
          <ListRestart size={30} />
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
                {t("cyclicTodos.title")} ({cyclicTodos?.length || 0})
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
                      {t("cyclicTodos.description")}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <DrawerDescription className="sr-only">
              {t("cyclicTodos.description")}
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable content area with calculated height */}
          <div
            className="px-2 overflow-hidden"
            style={{
              height: `calc(90svh - 15rem - ${keyboardHeight}px)` /* 240px for header + form */,
              marginTop: "5rem" /* space for header */,
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar space-y-2 pr-2 pb-24">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : cyclicTodos && cyclicTodos.length > 0 ? (
                cyclicTodos.map((todo: CyclicTodoRow) => (
                  <div
                    key={todo.id}
                    className="cyclic-todo-item flex items-center justify-between rounded-lg shadow-md p-3 bg-white min-h-[4.375rem] mr-2"
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
                                  onClick={() => deleteCyclicTodo(todo.id)}
                                  disabled={isDeletingCyclicTodo}
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
                <DialogTitle>{t("cyclicTodos.edit")}</DialogTitle>
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

          {/* Fixed bottom form area */}
          <div className="absolute bottom-2 left-0 right-0 bg-white backdrop-blur-sm p-4 rounded-lg shadow-md border-t border-stone-200 z-10">
            <CyclicTodoForm
              type="add"
              onSubmit={handleAddSubmit}
              isLoading={isCreatingCyclicTodo}
              inputRef={inputRef}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
