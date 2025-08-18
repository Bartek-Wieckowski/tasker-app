import { useAuth } from "@/contexts/AuthContext";
import { DatePicker } from "../DatePicker";
import TodosAdd from "./TodosAdd";
import TodosTabs from "./TodosTabs";
import GlobalSearchProvider from "@/contexts/GlobalSearchContext";
import { useNotifications } from "@/hooks/useNotifications";

const TodosList = () => {
  const { isAuth } = useAuth();

  useNotifications();

  return (
    isAuth && (
      <>
        <GlobalSearchProvider>
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex-1 order-2 sm:order-1">
              <TodosTabs />
            </div>
            <div className="order-1 sm:order-2 flex justify-center gap-2">
              <TodosAdd />
              <DatePicker />
            </div>
          </div>
        </GlobalSearchProvider>
      </>
    )
  );
};

export default TodosList;
