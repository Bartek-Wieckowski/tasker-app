import { TodoRow } from "@/types/types";
import TodosItemCard from "./TodosItemCard";

type TodosResultsTabProps = {
  todos: TodoRow[];
};

export default function TodosResultsTab({ todos }: TodosResultsTabProps) {
  return (
    <div className="max-h-[calc(100vh-290px)] md:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar mt-2">
      {todos.map((data) => (
        <TodosItemCard key={data.id} data={data} />
      ))}
    </div>
  );
}
