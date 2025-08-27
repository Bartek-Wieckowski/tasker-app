import { TodosAdd } from "./Todos/TodosAdd";
import { List, ListChecks, ListX, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import UserPanel from "./User/UserPanel";

type BottomNavigationProps = {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
};

export default function BottomNavigation({
  activeTab = "all",
  onTabChange,
}: BottomNavigationProps) {
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50">
      <div className="relative">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10 bg-stone-50 p-1 rounded-full">
          <TodosAdd />
        </div>

        <div className="bg-stone-800/80 backdrop-blur-[10px] border-t border-gray-700/50 px-4 py-2 relative flex justify-between items-center">
          <div className="flex justify-between gap-x-1 items-center relative">
            {/* All Todos */}
            <button
              onClick={() => handleTabClick("all")}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
                activeTab === "all"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-white"
              )}
            >
              <List className="xs:w-6 xs:h-6 w-4 h-4" />
            </button>

            {/* Completed Todos */}
            <button
              onClick={() => handleTabClick("completed")}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
                activeTab === "completed"
                  ? "bg-green-500/20 text-green-400"
                  : "text-white"
              )}
            >
              <ListChecks className="xs:w-6 xs:h-6 w-4 h-4" />
            </button>

            {/* Uncompleted Todos */}
            <button
              onClick={() => handleTabClick("notCompleted")}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
                activeTab === "notCompleted"
                  ? "bg-red-500/20 text-red-400"
                  : "text-white"
              )}
            >
              <ListX className="xs:w-6 xs:h-6 w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between max-w-[6.25rem] w-full">
            <button
              onClick={() => handleTabClick("stats")}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
                activeTab === "stats"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white"
              )}
            >
              <BarChart3 className="xs:w-6 xs:h-6 w-4 h-4" />
            </button>
            <UserPanel />
          </div>
        </div>
      </div>
    </nav>
  );
}
