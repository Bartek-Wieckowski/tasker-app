import TodosItemCard from './TodosItemCard';
import { TodoItemDetails } from '@/types/types';

type TodosResultsGloballyProps = {
  todos: TodoItemDetails[];
};

const TodosResultsGlobally = ({ todos }: TodosResultsGloballyProps) => {
  return (
    <>
      {todos?.map((data) => (
        <TodosItemCard key={data.id} data={data} isGlobalSearch={true} />
      ))}
    </>
  );
};

export default TodosResultsGlobally;
