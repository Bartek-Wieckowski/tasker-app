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
import { TodoRow } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateTodosOrder } from "@/api/mutations/todos/useUpdateTodosOrder";
import SortableItem from "../SortableItem";
import TodosItemCard from "./TodosItemCard";

type TodosResultsTabProps = {
  todos: TodoRow[];
};

export default function TodosResultsTab({ todos }: TodosResultsTabProps) {
  const { selectedDate, currentUser } = useAuth();
  const { updateTodosOrderMutation, isUpdatingTodosOrder } =
    useUpdateTodosOrder();
  const [localTodos, setLocalTodos] = useState<TodoRow[]>(todos);

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

    const orderUpdates = newTodos.map((todo, index) => ({
      id: todo.id,
      order_index: index + 1,
    }));

    try {
      await updateTodosOrderMutation({
        todoOrders: orderUpdates,
        selectedDate,
        currentUser,
      });
    } catch (error) {
      setLocalTodos(todos);
      console.error("Error updating todos order:", error);
    }
  };

  const todoIds = localTodos.map((todo) => todo.id);

  return (
    <div className="max-h-[calc(100vh-18.125rem)] md:max-h-[calc(100vh-15.625rem)] overflow-y-auto custom-scrollbar mt-2 pr-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
          {localTodos.map((todo) => (
            <SortableItem
              key={todo.id}
              id={todo.id}
              data={todo}
              isUpdating={isUpdatingTodosOrder}
              renderItem={({ data }) => <TodosItemCard data={data} />}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
