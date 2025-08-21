import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import SidebarNavigation from "@/components/ui/sidebar-navigation";
import DashboardStats from "@/components/ui/dashboard-stats";
import CadetProgressChart from "@/components/ui/cadet-progress-chart";
import FitnessMetrics from "@/components/ui/fitness-metrics";
import RecentActivities from "@/components/ui/recent-activities";
import AlertsPanel from "@/components/ui/alerts-panel";
import QuickActions from "@/components/ui/quick-actions";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const handleQuickAddCadet = () => {
    setLocation("/cadet-management");
  };

  const handleNotifications = () => {
    // Toggle notifications panel or navigate to communications
    setLocation("/communications");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
              <nav className="text-sm text-muted-foreground">
                <span>Home</span> / <span className="text-foreground font-medium">Dashboard</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <Button 
                onClick={handleQuickAddCadet}
                className="bg-navy-600 text-white hover:bg-navy-700 transition-colors" 
                data-testid="button-quick-add-cadet"
              >
                <Plus className="mr-2" size={16} />
                Add Cadet
              </Button>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={handleNotifications}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors relative" 
                  data-testid="button-notifications"
                  title="View notifications and communications"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    3
                  </span>
                </button>
              </div>

              {/* Date/Time */}
              <div className="text-sm text-muted-foreground">
                <p data-testid="current-date">{currentDate}</p>
                <p data-testid="current-time">{currentTime}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardStats />

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CadetProgressChart />
            <FitnessMetrics />
          </div>

          {/* Recent Activities and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <RecentActivities />
            <AlertsPanel />
          </div>

          {/* Quick Actions Section */}
          <QuickActions />
        </main>
      </div>
    </div>
  );
}
