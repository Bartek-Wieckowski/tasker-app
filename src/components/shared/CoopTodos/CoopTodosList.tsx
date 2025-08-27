import { useState, useEffect } from "react";
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
import { useUpdateCoopTodosOrder } from "@/api/mutations/coopTodos/useUpdateCoopTodosOrder";
import SortableItem from "../SortableItem";
import CoopTodoItemCard from "./CoopTodoItemCard";

type CoopTodo = {
  id: string | null;
  shared_table_id: string | null;
  creator_user_id: string | null;
  todo: string | null;
  todo_more_content: string | null;
  is_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  order_index: number | null;
  completed_at: string | null;
  completed_by_email: string | null;
  creator_email: string | null;
  table_name: string | null;
  todo_type: string | null;
  who_updated: string | null;
};

type CoopTodosListProps = {
  todos: CoopTodo[];
  sharedTableId: string;
  onEdit: (todo: {
    id: string | null;
    todo: string | null;
    todo_more_content: string | null;
  }) => void;
};

export default function CoopTodosList({
  todos,
  sharedTableId,
  onEdit,
}: CoopTodosListProps) {
  const { updateCoopTodosOrderMutation, isUpdatingCoopTodosOrder } =
    useUpdateCoopTodosOrder();
  const [localTodos, setLocalTodos] = useState<CoopTodo[]>(todos);

  useEffect(() => {
    setLocalTodos(todos);
  }, [todos]);

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

    const orderUpdates = newTodos
      .filter((todo) => todo.id !== null)
      .map((todo, index) => ({
        id: todo.id!,
        order_index: index + 1,
      }));

    try {
      await updateCoopTodosOrderMutation({
        todoOrders: orderUpdates,
        sharedTableId,
      });
    } catch (error) {
      setLocalTodos(todos);
      if (import.meta.env.DEV) {
        console.error("Failed to update coop todos order:", error);
      }
    }
  };

  const todoIds = localTodos
    .map((todo) => todo.id)
    .filter((id): id is string => id !== null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {localTodos
            .filter((todo) => todo.id !== null)
            .map((todo) => (
              <SortableItem
                key={todo.id}
                id={todo.id!}
                data={todo}
                isUpdating={isUpdatingCoopTodosOrder}
                renderItem={({ data }) => (
                  <CoopTodoItemCard data={data} onEdit={onEdit} />
                )}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
