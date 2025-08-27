import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCoopTodosByTableId } from "@/api/queries/coopTodos/useCoopTodos";
import CoopTodoItemCard from "./CoopTodoItemCard";
import CoopTodoForm from "./CoopTodoForm";
import { ArrowLeft } from "lucide-react";
import { useCreateCoopTodo } from "@/api/mutations/coopTodos/useCreateCoopTodo";
import { useUpdateCoopTodo } from "@/api/mutations/coopTodos/useUpdateCoopTodo";
import { useTranslation } from "react-i18next";

type CoopTodosDrawerProps = {
  tableId: string;
  tableName: string;
  children: React.ReactNode;
};

export default function CoopTodosDrawer({
  tableId,
  tableName,
  children,
}: CoopTodosDrawerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<{
    id: string;
    todo: string;
    todo_more_content: string | null;
  } | null>(null);

  const { data: todos, isLoading } = useCoopTodosByTableId(tableId);
  const { createCoopTodoMutation, isCreatingCoopTodo } = useCreateCoopTodo();
  const { updateCoopTodoMutation, isUpdatingCoopTodo } = useUpdateCoopTodo();

  const handleAddTodo = async (todoData: {
    todo: string;
    todoMoreContent?: string;
  }) => {
    try {
      await createCoopTodoMutation({
        sharedTableId: tableId,
        todo: todoData.todo,
        todoMoreContent: todoData.todoMoreContent,
      });
      setAddDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleEditTodo = async (todoData: {
    todo: string;
    todoMoreContent?: string;
  }) => {
    if (!editingTodo?.id) return;

    try {
      await updateCoopTodoMutation({
        todoId: editingTodo.id,
        todo: todoData.todo,
        todoMoreContent: todoData.todoMoreContent,
      });
      setEditingTodo(null);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleEditClick = (todo: {
    id: string | null;
    todo: string | null;
    todo_more_content: string | null;
  }) => {
    if (todo.id && todo.todo) {
      setEditingTodo({
        id: todo.id,
        todo: todo.todo,
        todo_more_content: todo.todo_more_content,
      });
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="h-[90svh] bg-stone-50">
        <div className="mx-auto w-full max-w-md h-full relative">
          <DrawerHeader className="absolute top-0 left-0 right-0 pb-4 bg-stone-50 z-10">
            <DrawerTitle className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-auto"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              {tableName}
            </DrawerTitle>
            <DrawerDescription>
              {t("coopTodos.sharedTasks")} ({todos?.length || 0})
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable content area for todos list only */}
          <div
            className="px-2 overflow-hidden"
            style={{
              height:
                "calc(90svh - 180px)" /* 240px for header + bottom button */,
              marginTop: "80px" /* space for header */,
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar  pr-2 pb-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("app.loading")}
                </div>
              ) : todos && todos.length > 0 ? (
                todos.map((todo) => (
                  <CoopTodoItemCard
                    key={todo.id}
                    data={todo}
                    onEdit={handleEditClick}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("coopTodos.noTasksInTable")}
                </div>
              )}
            </div>
          </div>

          {/* Fixed bottom add button */}
          <div className="absolute bottom-1 md:bottom-2 left-0 right-0 bg-white backdrop-blur-sm p-4 rounded-lg shadow-md border-t border-stone-200 z-10">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="w-fit"
              size="sm"
            >
              {t("common.addNewTodo")}
            </Button>
          </div>
        </div>
      </DrawerContent>

      {/* Dialog dodawania poza Drawer */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.add")}</DialogTitle>
          </DialogHeader>
          <CoopTodoForm
            onSubmit={handleAddTodo}
            isSubmitting={isCreatingCoopTodo}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog edycji poza Drawer żeby uniknąć problemów z z-index */}
      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.editTodo")}</DialogTitle>
          </DialogHeader>
          {editingTodo && (
            <CoopTodoForm
              onSubmit={handleEditTodo}
              isSubmitting={isUpdatingCoopTodo}
              onCancel={() => setEditingTodo(null)}
              initialData={{
                todo: editingTodo.todo || "",
                todoMoreContent: editingTodo.todo_more_content || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}
