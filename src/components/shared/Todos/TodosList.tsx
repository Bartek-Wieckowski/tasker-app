import { DatePicker } from '../DatePicker';
import TodosAdd from './TodosAdd';
import TodosTabs from './TodosTabs';

const TodosList = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-2">
      <div className="flex-1 order-2 sm:order-1">
        <TodosTabs />
      </div>
      <div className="order-1 sm:order-2 flex justify-center gap-2">
        <TodosAdd />
        <DatePicker />
      </div>
    </div>
  );
};

export default TodosList;
