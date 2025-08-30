import { useAuth } from "@/contexts/AuthContext";
import DatePicker from "../DatePicker";
import TodosTabs from "./TodosTabs";
import GlobalSearchProvider from "@/contexts/GlobalSearchContext";
import { useNotifications } from "@/hooks/useNotifications";

export default function TodosList() {
  const { isAuth } = useAuth();

  useNotifications();

  return (
    isAuth && (
      <div className="h-full flex flex-col">
        <GlobalSearchProvider>
          <div className="flex flex-col md:flex-row justify-between gap-2 flex-shrink-0 mb-4">
            <div className="flex-1 order-2 md:order-1">
              <TodosTabs />
            </div>
            <div className="order-1 md:order-2 flex justify-center gap-2">
              <DatePicker />
            </div>
          </div>
        </GlobalSearchProvider>
      </div>
    )
  );
}
