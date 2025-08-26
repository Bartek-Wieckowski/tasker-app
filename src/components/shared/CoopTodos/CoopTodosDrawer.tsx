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
import { Plus, ArrowLeft } from "lucide-react";
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
  const [showAddForm, setShowAddForm] = useState(false);
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
      setShowAddForm(false);
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
      <DrawerContent className="min-h-[90vh]">
        <div className="mx-auto w-full max-w-sm py-3">
          <DrawerHeader>
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

          <div className="space-y-4 px-4">
            {!showAddForm ? (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("common.addNewTodo")}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    {t("common.addNewTodo")}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
                <CoopTodoForm
                  onSubmit={handleAddTodo}
                  isSubmitting={isCreatingCoopTodo}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            )}

            <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[500px]">
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
        </div>
      </DrawerContent>

      {/* Dialog edycji poza Drawer żeby uniknąć problemów z z-index */}
      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("coopTodos.editTask")}</DialogTitle>
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
