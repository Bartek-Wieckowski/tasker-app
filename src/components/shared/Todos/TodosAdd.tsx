import { PlusCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import TodoForm from './TodoForm';
const TodosAdd = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className='border-none sm:border-solid'>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new todo item</DialogTitle>
        </DialogHeader>
        <TodoForm />
      </DialogContent>
    </Dialog>
  );
};

export default TodosAdd;
