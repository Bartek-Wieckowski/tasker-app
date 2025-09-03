import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/types";
import {
  getTodosStatsByDate,
  getTodosStatsByWeek,
  getTodosStatsByMonth,
} from "@/api/apiTodos";
import { QUERY_KEYS } from "@/api/constants";

export type StatsPeriod = "day" | "week" | "month";

export function useTodosStats(
  selectedDate: string,
  currentUser: User,
  period: StatsPeriod = "day"
) {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.todos, "stats", selectedDate, period],
    queryFn: () => {
      switch (period) {
        case "day":
          return getTodosStatsByDate(selectedDate, currentUser);
        case "week":
          return getTodosStatsByWeek(selectedDate, currentUser);
        case "month":
          return getTodosStatsByMonth(selectedDate, currentUser);
        default:
          return getTodosStatsByDate(selectedDate, currentUser);
      }
    },
    enabled: !!selectedDate && !!currentUser,
    staleTime: 30000, // 30 seconds
  });

  return { stats, isLoading, isError };
}
