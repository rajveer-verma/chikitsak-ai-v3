
import { cn } from "@/lib/utils";
import { Heart, Thermometer, ActivitySquare, Brain } from "lucide-react";





export function HealthSummary({ metrics, className }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className={cn(
            "flex items-center p-3 rounded-lg bg-white shadow-sm border",
            metric.status === "normal" && "border-green-100 bg-green-50/30",
            metric.status === "warning" && "border-amber-100 bg-amber-50/30",
            metric.status === "danger" && "border-red-100 bg-red-50/30",
            metric.status === "good" && "border-blue-100 bg-blue-50/30"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-3",
              metric.status === "normal" && "text-green-500 bg-green-100",
              metric.status === "warning" && "text-amber-500 bg-amber-100",
              metric.status === "danger" && "text-red-500 bg-red-100",
              metric.status === "good" && "text-blue-500 bg-blue-100"
            )}
          >
            {metric.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{metric.name}</p>
            <p className="font-semibold">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export const defaultMetrics = [
  {
    name: "Heart Rate",
    value: "72 BPM",
    status: "normal",
    icon: <Heart size={18} />,
  },
  {
    name: "Temperature",
    value: "97.8°F",
    status: "normal",
    icon: <Thermometer size={18} />,
  },
  {
    name: "Activity",
    value: "3,542 steps",
    status: "good",
    icon: <ActivitySquare size={18} />,
  },
  {
    name: "Mood",
    value: "Relaxed",
    status: "good",
    icon: <Brain size={18} />,
  },
];
