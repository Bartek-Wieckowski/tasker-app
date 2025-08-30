import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { GlobalTodoForm } from "./GlobalTodoForm";
import { useEditGlobalTodo } from "@/api/mutations/globalTodos/useEditGlobalTodo";
import { useAssignGlobalTodo } from "@/api/mutations/globalTodos/useAssignGlobalTodo";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { localeMap } from "@/lib/helpers";
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
import { GlobalTodoRow } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateGlobalTodosOrder } from "@/api/mutations/globalTodos/useUpdateGlobalTodosOrder";
import SortableItem from "../SortableItem";
import GlobalTodoItemCard from "@/components/shared/GlobalTodos/GlobalTodoItemCard";

type GlobalTodosListProps = {
  globalTodos: GlobalTodoRow[];
};

export default function GlobalTodosList({ globalTodos }: GlobalTodosListProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { currentUser } = useAuth();
  const { updateGlobalTodosOrderMutation, isUpdatingGlobalTodosOrder } =
    useUpdateGlobalTodosOrder();
  const { editGlobalTodoItem, isEditingGlobalTodo } = useEditGlobalTodo(
    currentUser.accountId
  );
  const { assignGlobalTodo, isAssigningGlobalTodo } = useAssignGlobalTodo(
    currentUser.accountId
  );
  const [localTodos, setLocalTodos] = useState<GlobalTodoRow[]>(globalTodos);
  const [editingTodo, setEditingTodo] = useState<GlobalTodoRow | null>(null);
  const [assigningTodo, setAssigningTodo] = useState<GlobalTodoRow | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    setLocalTodos(globalTodos);
  }, [globalTodos]);

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
      await updateGlobalTodosOrderMutation({
        todoOrders: orderUpdates,
        userId: currentUser.accountId,
      });
    } catch (error) {
      setLocalTodos(globalTodos);
      console.error("Error updating global todos order:", error);
    }
  };

  const handleEditSubmit = async (data: { todo: string }) => {
    if (!editingTodo) return;

    try {
      await editGlobalTodoItem({
        todoId: editingTodo.id,
        newTodoName: data.todo,
      });
      setEditingTodo(null);
    } catch (error) {
      console.error("Error editing global todo:", error);
    }
  };

  const handleAssignToDay = async () => {
    if (!selectedDate || !assigningTodo) return;

    try {
      await assignGlobalTodo({
        todoId: assigningTodo.id,
        date: selectedDate,
      });
      setAssigningTodo(null);
      setSelectedDate(undefined);
    } catch (error) {
      console.error("Error assigning global todo:", error);
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
              isUpdating={isUpdatingGlobalTodosOrder}
              renderItem={({ data }) => (
                <GlobalTodoItemCard
                  data={data}
                  onEdit={(todo) => setEditingTodo(todo)}
                  onAssign={(todo) => setAssigningTodo(todo)}
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
            <DialogTitle>{t("globalTodos.edit")}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {editingTodo && (
            <GlobalTodoForm
              type="edit"
              onSubmit={handleEditSubmit}
              isLoading={isEditingGlobalTodo}
              defaultValues={{
                todo: editingTodo.todo || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assigningTodo}
        onOpenChange={(open) => !open && setAssigningTodo(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.assignToDay")}</DialogTitle>
            <DialogDescription>
              {t("common.assignToDayDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              locale={localeMap[currentLanguage]}
              className="flex justify-center"
            />
            <Button
              onClick={handleAssignToDay}
              disabled={!selectedDate || isAssigningGlobalTodo}
              data-testid="assign-global-todo-button"
            >
              {isAssigningGlobalTodo
                ? t("common.assigning")
                : t("todosItemCard.confirmMove")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
