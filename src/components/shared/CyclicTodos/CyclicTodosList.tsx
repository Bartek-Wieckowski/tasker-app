import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CyclicTodoForm } from "./CyclicTodoForm";
import { useEditCyclicTodo } from "@/api/mutations/cyclicTodos/useEditCyclicTodo";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CyclicTodoRow } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateCyclicTodosOrder } from "@/api/mutations/cyclicTodos/useUpdateCyclicTodosOrder";
import SortableItem from "../SortableItem";
import CyclicTodoItemCard from "./CyclicTodoItemCard";

type CyclicTodosListProps = {
  cyclicTodos: CyclicTodoRow[];
};

export default function CyclicTodosList({ cyclicTodos }: CyclicTodosListProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { updateCyclicTodosOrderMutation, isUpdatingCyclicTodosOrder } =
    useUpdateCyclicTodosOrder();
  const { editCyclicTodoItem, isEditingCyclicTodo } = useEditCyclicTodo(
    currentUser.accountId
  );
  const [localTodos, setLocalTodos] = useState<CyclicTodoRow[]>(cyclicTodos);
  const [editingTodo, setEditingTodo] = useState<CyclicTodoRow | null>(null);

  useEffect(() => {
    setLocalTodos(cyclicTodos);
  }, [cyclicTodos]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localTodos.findIndex((todo) => todo.id === active.id);
    const newIndex = localTodos.findIndex((todo) => todo.id === over.id);

    const newTodos = arrayMove(localTodos, oldIndex, newIndex);
    setLocalTodos(newTodos);

    const orderUpdates = newTodos.map((todo, index) => ({
      id: todo.id,
      order_index: index + 1,
    }));

    try {
      await updateCyclicTodosOrderMutation({
        todoOrders: orderUpdates,
        userId: currentUser.accountId,
      });
    } catch (error) {
      setLocalTodos(cyclicTodos);
      console.error("Error updating cyclic todos order:", error);
    }
  };

  const handleEditSubmit = async (data: { todo: string }) => {
    if (!editingTodo) return;

    try {
      await editCyclicTodoItem({
        todoId: editingTodo.id,
        newTodoName: data.todo,
      });
      setEditingTodo(null);
    } catch (error) {
      console.error("Error editing cyclic todo:", error);
    }
  };

  const todoIds = localTodos.map((todo) => todo.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {localTodos.map((todo) => (
            <SortableItem
              key={todo.id}
              id={todo.id}
              data={todo}
              isUpdating={isUpdatingCyclicTodosOrder}
              renderItem={({ data }) => (
                <CyclicTodoItemCard
                  data={data}
                  onEdit={(todo) => setEditingTodo(todo)}
                />
              )}
            />
          ))}
        </div>
      </SortableContext>

      <Dialog
        open={!!editingTodo}
        onOpenChange={(open) => !open && setEditingTodo(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cyclicTodos.edit")}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {editingTodo && (
            <CyclicTodoForm
              type="edit"
              onSubmit={handleEditSubmit}
              isLoading={isEditingCyclicTodo}
              defaultValues={{
                todo: editingTodo.todo || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
