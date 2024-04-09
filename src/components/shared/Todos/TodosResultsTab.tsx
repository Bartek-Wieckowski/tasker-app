import { TodoItemDetails } from '@/types/types';
import { TabsContent } from '@radix-ui/react-tabs';
import TodosItemCard from './TodosItemCard';

type TodosResultsTabProps = {
  todos: TodoItemDetails[] | undefined;
  tabValue: string;
};

const TodosResultsTab = ({ todos, tabValue }: TodosResultsTabProps) => {
  return (
    <TabsContent value={tabValue}>
      {todos?.map((data: TodoItemDetails) => (
        <TodosItemCard key={data.id} data={data} />
      ))}
    </TabsContent>
  );
};

export default TodosResultsTab;
