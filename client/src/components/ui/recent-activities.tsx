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

// Mock activities for now
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'fitness',
    description: 'Cadet Rodriguez completed Physical Fitness Assessment with 95% score',
    timestamp: '2 hours ago',
    cadetName: 'Cadet Rodriguez',
  },
  {
    id: '2',
    type: 'mentorship',
    description: 'New mentorship pairing: Staff Sgt. Kim assigned to Cadet Thompson',
    timestamp: '4 hours ago',
    cadetName: 'Cadet Thompson',
    mentorName: 'Staff Sgt. Kim',
  },
  {
    id: '3',
    type: 'incident',
    description: 'Behavior incident reported for Cadet Johnson - Late for formation',
    timestamp: '6 hours ago',
    cadetName: 'Cadet Johnson',
  },
  {
    id: '4',
    type: 'career',
    description: 'Career pathway updated for Cadet Williams - Information Technology',
    timestamp: '1 day ago',
    cadetName: 'Cadet Williams',
  },
];

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
  // For now using mock data, replace with real API call
  const activities = mockActivities;

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
      </div>
    </div>
  );
}
