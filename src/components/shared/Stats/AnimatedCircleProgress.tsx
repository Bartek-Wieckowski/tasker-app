import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AnimatedCircleProgressProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  count: number;
  className?: string;
};

export default function AnimatedCircleProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  label,
  count,
  className,
}: AnimatedCircleProgressProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    // Reset and animate percentage
    setAnimatedPercentage(0);
    setAnimatedCount(0);

    const animationDuration = 1500; // 1.5 seconds
    const steps = 60; // 60fps
    const stepDuration = animationDuration / steps;

    let currentStep = 0;

    const animate = () => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Easing function

      setAnimatedPercentage(Math.round(percentage * easeOutQuart));
      setAnimatedCount(Math.round(count * easeOutQuart));

      if (currentStep < steps) {
        setTimeout(animate, stepDuration);
      } else {
        // Ensure final values are exact
        setAnimatedPercentage(percentage);
        setAnimatedCount(count);
      }
    };

    const startDelay = 200; // Small delay before starting animation
    setTimeout(animate, startDelay);
  }, [percentage, count]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          width={size}
          height={size}
          className="absolute transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
        </svg>

        {/* Progress circle */}
        <svg
          width={size}
          height={size}
          className="absolute transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75 ease-out"
          />
        </svg>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-bold ${
              animatedPercentage === 100 ? "text-xl" : "text-2xl"
            }`}
            style={{ color }}
          >
            {animatedPercentage}%
          </span>
        </div>
      </div>

      {/* Label and count */}
      <div className="text-center mt-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">
          {animatedCount}
        </span>
      </div>
    </div>
  );
}
