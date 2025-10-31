import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import { Trophy, Handshake, AlertCircle, GraduationCap } from "lucide-react";

interface Activity {
  id: string;
  type: 'fitness' | 'mentorship' | 'incident' | 'career';
  description: string;
  timestamp: string;
  cadetName?: string;
  mentorName?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'fitness': return Trophy;
    case 'mentorship': return Handshake;
    case 'incident': return AlertCircle;
    case 'career': return GraduationCap;
    default: return Trophy;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'fitness': return 'bg-military-100 text-military-600';
    case 'mentorship': return 'bg-blue-100 text-blue-600';
    case 'incident': return 'bg-red-100 text-red-600';
    case 'career': return 'bg-academy-gold/20 text-academy-gold';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function RecentActivities() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/activities?limit=5");
      return response.json();
    },
  });

  return (
    <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">Recent Activities</h3>
          <button className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="button-view-all-activities">
            View All
          </button>
        </div>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activities</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start space-x-4" data-testid={`activity-${activity.id}`}>
                <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-card-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${activity.id}`}>
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
