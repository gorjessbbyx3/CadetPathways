import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import { Users, Handshake, AlertTriangle, GraduationCap, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardStats {
  totalCadets: number;
  activeMentorships: number;
  behaviorIncidents: number;
  graduationReady: number;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/dashboard/stats");
      return response.json();
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Cadets */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Cadets</p>
            <p className="text-3xl font-bold text-foreground" data-testid="stat-total-cadets">
              {stats.totalCadets}
            </p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp size={16} className="mr-1" />
              <span>Active enrollment</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-navy-600/10 rounded-lg flex items-center justify-center">
            <Users className="text-navy-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Active Mentorships */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Mentorships</p>
            <p className="text-3xl font-bold text-foreground" data-testid="stat-active-mentorships">
              {stats.activeMentorships}
            </p>
            <p className="text-sm text-military-600 flex items-center mt-1">
              <TrendingUp size={16} className="mr-1" />
              <span>{Math.round((stats.activeMentorships / stats.totalCadets) * 100)}% participation</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-military-600/10 rounded-lg flex items-center justify-center">
            <Handshake className="text-military-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Behavior Incidents */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Open Incidents</p>
            <p className="text-3xl font-bold text-foreground" data-testid="stat-behavior-incidents">
              {stats.behaviorIncidents}
            </p>
            <p className="text-sm text-destructive flex items-center mt-1">
              <TrendingDown size={16} className="mr-1" />
              <span>Requiring attention</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="text-destructive text-xl" />
          </div>
        </div>
      </div>

      {/* Graduation Ready */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Graduation Ready</p>
            <p className="text-3xl font-bold text-foreground" data-testid="stat-graduation-ready">
              {stats.graduationReady}
            </p>
            <p className="text-sm text-academy-gold flex items-center mt-1">
              <GraduationCap size={16} className="mr-1" />
              <span>Next cycle candidates</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-academy-gold/10 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-academy-gold text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
