import { TodoRow } from "@/types/types";
import { TabsContent } from "@radix-ui/react-tabs";
import TodosItemCard from "./TodosItemCard";

type TodosResultsTabProps = {
  todos: TodoRow[];
  tabValue: string;
};

export default function TodosResultsTab({
  todos,
  tabValue,
}: TodosResultsTabProps) {
  return (
    <TabsContent value={tabValue}>
      {todos.map((data) => (
        <TodosItemCard key={data.id} data={data} />
      ))}
    </TabsContent>
  );
}
