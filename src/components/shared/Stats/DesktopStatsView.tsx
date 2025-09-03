import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTodosStats, StatsPeriod } from "@/api/queries/todos/useTodosStats";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type CompactCircleProps = {
  percentage: number;
  color: string;
  size?: number;
};

function CompactCircle({ percentage, color, size = 40 }: CompactCircleProps) {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={2}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(`font-semibold`, {
            "text-[10px]": percentage === 100,
            "text-sm": percentage !== 100,
          })}
          style={{ color }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export default function DesktopStatsView() {
  const { t } = useTranslation();
  const { selectedDate, currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>("day");

  const { stats, isLoading } = useTodosStats(
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
      icon: <Calendar className="w-3 h-3" />,
    },
    {
      value: "week",
      label: t("stats.week"),
      icon: <CalendarDays className="w-3 h-3" />,
    },
    {
      value: "month",
      label: t("stats.month"),
      icon: <CalendarRange className="w-3 h-3" />,
    },
  ];

  if (isLoading || !stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      {/* Period selector */}
      <div className="flex justify-center mb-3">
        <div className="flex rounded border border-gray-200 overflow-hidden">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPeriod(option.value)}
              className={cn(
                "h-7 px-2 rounded-none border-0 text-xs",
                selectedPeriod === option.value
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {option.icon}
              <span className="ml-1">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats display */}
      {stats.total === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-300" />
          <p className="text-xs">{t("stats.noTasks")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Circles in vertical layout */}
          <div className="flex flex-col  space-y-2">
            <div className="flex items-center space-x-2">
              <CompactCircle
                percentage={stats.completedPercentage}
                color="#22c55e"
              />
              <div className="text-left flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    {t("stats.completed")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.completed}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <CompactCircle
                percentage={stats.notStartedPercentage}
                color="#ef4444"
              />
              <div className="text-left flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    {t("stats.notStarted")}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.notStarted}
                </span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="text-center pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {t("stats.totalTasks")}:
            </span>
            <span className="ml-1 text-sm font-semibold text-gray-900">
              {stats.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
