import { TodoRow } from "@/types/types";
import TodosItemCard from "./TodosItemCard";

type TodosResultsTabProps = {
  todos: TodoRow[];
};

export default function TodosResultsTab({ todos }: TodosResultsTabProps) {
  return (
    <div className="max-h-[calc(100vh-18.125rem)] md:max-h-[calc(100vh-15.625rem)] overflow-y-auto custom-scrollbar mt-2">
      {todos.map((data) => (
        <TodosItemCard key={data.id} data={data} />
      ))}
    </div>
  );
}
