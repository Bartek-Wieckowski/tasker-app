import TodosItemCard from "./TodosItemCard";
import { TodoRow } from "@/types/types";

type TodosResultsGloballyProps = {
  todos: TodoRow[];
};

const TodosResultsGlobally = ({ todos }: TodosResultsGloballyProps) => {
  return (
    <>
      {todos.map((data) => (
        <TodosItemCard key={data.id} data={data} isGlobalSearch={true} />
      ))}
    </>
  );
};

export default TodosResultsGlobally;
