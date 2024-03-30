import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useTodosByDate } from '@/api/queries/todos/useTodosByDate';
import { useAuth } from '@/contexts/AuthContext';
import { TodoItemDetails } from '@/types/types';
import { List, ListChecks, ListX, Loader } from 'lucide-react';
import TodosItemCard from './TodosItemCard';

const TodosTabs = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { selectedDate, currentUser } = useAuth();
  const { isLoading, isError, todos } = useTodosByDate(selectedDate, currentUser);

  const todosChecked = todos?.filter((todo) => todo.isCompleted === true);
  const todosNotChecked = todos?.filter((todo) => todo.isCompleted !== true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 574) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">{isMobile ? <List /> : 'All'}</TabsTrigger>
        <TabsTrigger value="completed">{isMobile ? <ListChecks /> : 'Completed'}</TabsTrigger>
        <TabsTrigger value="uncompleted">{isMobile ? <ListX /> : 'Uncompleted'}</TabsTrigger>
      </TabsList>
      <Input type="text" placeholder="Search task :)" className="my-2" />
      {/* //TODO: ZROBIĆ TO LEPIEJ */}
      {todos?.length === 0 && 'Add your first task!'}
      <TabsContent value="all">
        {todos?.map((data: TodoItemDetails) => (
          <TodosItemCard key={data.id} data={data} />
        ))}
      </TabsContent>
      <TabsContent value="completed">
        {todosChecked?.map((data: TodoItemDetails) => (
          <TodosItemCard key={data.id} data={data} />
        ))}
      </TabsContent>
      <TabsContent value="uncompleted">
        {todosNotChecked?.map((data: TodoItemDetails) => (
          <TodosItemCard key={data.id} data={data} />
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default TodosTabs;
