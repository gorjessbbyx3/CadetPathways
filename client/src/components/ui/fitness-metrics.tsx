import { Activity, Dumbbell, Zap } from "lucide-react";

interface FitnessMetric {
  category: string;
  icon: any;
  improvement: string;
  progress: number;
  color: string;
}

const fitnessMetrics: FitnessMetric[] = [
  {
    category: "Cardio Fitness",
    icon: Activity,
    improvement: "+23%",
    progress: 78,
    color: "green",
  },
  {
    category: "Strength Training", 
    icon: Dumbbell,
    improvement: "+18%",
    progress: 68,
    color: "blue",
  },
  {
    category: "Flexibility",
    icon: Zap,
    improvement: "+15%",
    progress: 60,
    color: "purple",
  },
];

const getColorClasses = (color: string) => {
  const colorMap = {
    green: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      progress: "bg-green-500",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      progress: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      progress: "bg-purple-500",
    },
  };
  return colorMap[color as keyof typeof colorMap];
};

export default function FitnessMetrics() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Physical Fitness Metrics</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="button-view-all-fitness">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {fitnessMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const colors = getColorClasses(metric.color);
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={colors.text} size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{metric.category}</p>
                  <p className="text-xs text-muted-foreground">Average improvement</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${colors.text}`} data-testid={`fitness-${metric.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  {metric.improvement}
                </p>
                <div className="fitness-progress-bar">
                  <div 
                    className={`fitness-progress-fill ${colors.progress}`}
                    style={{ width: `${metric.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
