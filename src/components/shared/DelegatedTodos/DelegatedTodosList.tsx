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
import { DelegatedTodoForm } from "./DelegatedTodoForm";
import { useEditDelegatedTodo } from "@/api/mutations/delegatedTodos/useEditDelegatedTodo";
import { useAssignDelegatedTodo } from "@/api/mutations/delegatedTodos/useAssignDelegatedTodo";
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
import { DelegatedTodoRow } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateDelegatedTodosOrder } from "@/api/mutations/delegatedTodos/useUpdateDelegatedTodosOrder";
import SortableItem from "../SortableItem";
import DelegatedTodoItemCard from "./DelegatedTodoItemCard";

type DelegatedTodosListProps = {
  delegatedTodos: DelegatedTodoRow[];
};

export default function DelegatedTodosList({
  delegatedTodos,
}: DelegatedTodosListProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { currentUser } = useAuth();
  const { updateDelegatedTodosOrderMutation, isUpdatingDelegatedTodosOrder } =
    useUpdateDelegatedTodosOrder();
  const { editDelegatedTodoItem, isEditingDelegatedTodo } =
    useEditDelegatedTodo(currentUser.accountId);
  const { assignDelegatedTodo, isAssigningDelegatedTodo } =
    useAssignDelegatedTodo(currentUser.accountId);
  const [localTodos, setLocalTodos] =
    useState<DelegatedTodoRow[]>(delegatedTodos);
  const [editingTodo, setEditingTodo] = useState<DelegatedTodoRow | null>(null);
  const [assigningTodo, setAssigningTodo] = useState<DelegatedTodoRow | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    setLocalTodos(delegatedTodos);
  }, [delegatedTodos]);

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
      await updateDelegatedTodosOrderMutation({
        todoOrders: orderUpdates,
        userId: currentUser.accountId,
      });
    } catch (error) {
      setLocalTodos(delegatedTodos);
      console.error("Error updating delegated todos order:", error);
    }
  };

  const handleEditSubmit = async (data: { todo: string }) => {
    if (!editingTodo) return;

    try {
      await editDelegatedTodoItem({
        todoId: editingTodo.id,
        newTodoName: data.todo,
      });
      setEditingTodo(null);
    } catch (error) {
      console.error("Error editing delegated todo:", error);
    }
  };

  const handleAssignToDay = async () => {
    if (!selectedDate || !assigningTodo) return;

    try {
      await assignDelegatedTodo({
        todoId: assigningTodo.id,
        date: selectedDate,
      });
      setAssigningTodo(null);
      setSelectedDate(undefined);
    } catch (error) {
      console.error("Error assigning delegated todo:", error);
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
              isUpdating={isUpdatingDelegatedTodosOrder}
              renderItem={({ data }) => (
                <DelegatedTodoItemCard
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
            <DialogTitle>{t("delegatedTodos.edit")}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {editingTodo && (
            <DelegatedTodoForm
              type="edit"
              onSubmit={handleEditSubmit}
              isLoading={isEditingDelegatedTodo}
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
              disabled={!selectedDate || isAssigningDelegatedTodo}
            >
              {isAssigningDelegatedTodo
                ? t("common.assigning")
                : t("todosItemCard.confirmMove")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
