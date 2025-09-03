import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTodosStats, StatsPeriod } from "@/api/queries/todos/useTodosStats";
import AnimatedCircleProgress from "./AnimatedCircleProgress";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "../Loader";
import { cn } from "@/lib/utils";

export default function MobileStatsView() {
  const { t } = useTranslation();
  const { selectedDate, currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>("day");

  const { stats, isLoading, isError } = useTodosStats(
    selectedDate,
    currentUser,
    selectedPeriod
  );

  const periodOptions: Array<{
    value: StatsPeriod;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      value: "day",
      label: t("stats.day"),
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      value: "week",
      label: t("stats.week"),
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      value: "month",
      label: t("stats.month"),
      icon: <CalendarRange className="w-4 h-4" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center text-gray-500 py-8">
          {t("stats.errorText")}
        </div>
      </div>
    );
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "day":
        return t("stats.dayStats");
      case "week":
        return t("stats.weekStats");
      case "month":
        return t("stats.monthStats");
      default:
        return t("stats.dayStats");
    }
  };

  const getDateRange = () => {
    if (selectedPeriod === "day") {
      return selectedDate;
    }
    if ("startDate" in stats && "endDate" in stats) {
      return `${stats.startDate} - ${stats.endDate}`;
    }
    return selectedDate;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Header with period selector */}
      <div className="flex flex-col  justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {getPeriodLabel()}
          </h3>
          <p className="text-sm text-gray-500">{getDateRange()}</p>
        </div>

        <div className="flex flex-col xs:flex-row rounded-lg border border-gray-200 overflow-hidden">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedPeriod === option.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(option.value)}
              className={cn(
                `rounded-none border-0 justify-start xs:justify-center`,
                {
                  "bg-blue-600 text-white hover:bg-blue-700":
                    selectedPeriod === option.value,
                  "bg-white text-gray-600 hover:bg-gray-50":
                    selectedPeriod !== option.value,
                }
              )}
            >
              {option.icon}
              <span className="ml-2">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Statistics circles */}
      {stats.total === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>{t("stats.noTasks")}</p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8 py-4">
          <AnimatedCircleProgress
            percentage={stats.completedPercentage}
            color="#22c55e"
            label={t("stats.completed")}
            count={stats.completed}
          />

          <AnimatedCircleProgress
            percentage={stats.notStartedPercentage}
            color="#ef4444"
            label={t("stats.notStarted")}
            count={stats.notStarted}
          />
        </div>
      )}

      {/* Total tasks summary */}
      {stats.total > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <span className="text-sm text-gray-500">
              {t("stats.totalTasks")}:
            </span>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              {stats.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
