import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EllipsisVertical, List, ListChecks, ListX } from 'lucide-react';
import { ROUTES } from '@/routes/constants';
import TodoForm from './TodoForm';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

const dummydata = [
  { id: 'jeden', todoName: 'todo item 1', content: 'lasldsladalsdlaslsda' },
  { id: 'dwa', todoName: 'todo item 2', content: '22345654324567654' },
];

const TodosTabs = () => {
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">{isMobile ? <List /> : 'All'}</TabsTrigger>
        <TabsTrigger value="completed">{isMobile ? <ListChecks /> : 'Completed'}</TabsTrigger>
        <TabsTrigger value="uncompleted">{isMobile ? <ListX /> : 'Uncompleted'}</TabsTrigger>
      </TabsList>
      <Input type="text" placeholder="Search task :)"  className='my-2'/>
      <TabsContent value="all">
        {dummydata.map((data) => (
          <div className="flex justify-between border border-stone-200 rounded-lg mb-3 p-3" key={data.id}>
            <div className="flex items-center space-x-2 w-full">
              <Checkbox id={data.id} />
              <label htmlFor={data.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                <div>{data.todoName}</div>
              </label>
            </div>
            <Popover>
              <div className="flex items-center justify-between space-x-4 px-4">
                <PopoverTrigger asChild>
                  <EllipsisVertical className="cursor-pointer" />
                </PopoverTrigger>
              </div>

              <PopoverContent className="space-y-2">
                <div className="flex flex-col">
                  <div className="flex justify-end gap-2">
                    <Button asChild>
                      <Link to={ROUTES.todoDetails(data.id)}>Details</Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Todo Item</DialogTitle>
                        </DialogHeader>
                        <TodoForm />
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive">Delete</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default TodosTabs;
