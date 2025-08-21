import { UserPlus, ClipboardList, Dumbbell, Handshake, Megaphone, FileText, Calendar, BookOpen, Trophy, NotebookPen } from "lucide-react";
import { useLocation } from "wouter";

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  action: () => void;
}

const getColorClasses = (color: string) => {
  const colorMap = {
    navy: {
      bg: 'bg-navy-600/10 group-hover:bg-navy-600/20',
      icon: 'text-navy-600',
    },
    red: {
      bg: 'bg-red-100 group-hover:bg-red-200 dark:bg-red-900/20 dark:group-hover:bg-red-900/30',
      icon: 'text-red-600',
    },
    green: {
      bg: 'bg-green-100 group-hover:bg-green-200 dark:bg-green-900/20 dark:group-hover:bg-green-900/30',
      icon: 'text-green-600',
    },
    purple: {
      bg: 'bg-purple-100 group-hover:bg-purple-200 dark:bg-purple-900/20 dark:group-hover:bg-purple-900/30',
      icon: 'text-purple-600',
    },
    blue: {
      bg: 'bg-blue-100 group-hover:bg-blue-200 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/30',
      icon: 'text-blue-600',
    },
    gold: {
      bg: 'bg-academy-gold/20 group-hover:bg-academy-gold/30',
      icon: 'text-academy-gold',
    },
    orange: {
      bg: 'bg-orange-100 group-hover:bg-orange-200 dark:bg-orange-900/20 dark:group-hover:bg-orange-900/30',
      icon: 'text-orange-600',
    },
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.navy;
};

export default function QuickActions() {
  const [location, navigate] = useLocation();
  
  const handleNavigation = (path: string, actionName: string) => {
    // Add visual feedback before navigation
    console.log(`Navigating to ${actionName}...`);
    navigate(path);
  };
  
  const quickActions: QuickAction[] = [
    {
      id: 'add-cadet',
      label: 'Add New Cadet',
      icon: UserPlus,
      color: 'navy',
      action: () => handleNavigation('/cadet-management', 'Add New Cadet'),
    },
    {
      id: 'record-incident',
      label: 'Record Incident',
      icon: ClipboardList,
      color: 'red',
      action: () => handleNavigation('/behavior-tracking', 'Record Incident'),
    },
    {
      id: 'fitness-assessment',
      label: 'Fitness Assessment',
      icon: Dumbbell,
      color: 'green',
      action: () => handleNavigation('/physical-fitness', 'Fitness Assessment'),
    },
    {
      id: 'assign-mentor',
      label: 'Assign Mentor',
      icon: Handshake,
      color: 'purple',
      action: () => handleNavigation('/mentorship-program', 'Assign Mentor'),
    },
    {
      id: 'academic-timetable',
      label: 'Academic Timetable',
      icon: Calendar,
      color: 'orange',
      action: () => handleNavigation('/academic-timetable', 'Academic Timetable'),
    },
    {
      id: 'assignment-management',
      label: 'Assignments',
      icon: BookOpen,
      color: 'blue',
      action: () => handleNavigation('/assignment-management', 'Assignments'),
    },
    {
      id: 'mock-tests',
      label: 'Mock Tests',
      icon: Trophy,
      color: 'purple',
      action: () => handleNavigation('/mock-tests', 'Mock Tests'),
    },
    {
      id: 'class-diary',
      label: 'Class Diary',
      icon: NotebookPen,
      color: 'green',
      action: () => handleNavigation('/class-diary', 'Class Diary'),
    },
    {
      id: 'send-notice',
      label: 'Send Notice',
      icon: Megaphone,
      color: 'navy',
      action: () => handleNavigation('/communications', 'Send Notice'),
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      color: 'gold',
      action: () => handleNavigation('/analytics-reports', 'Generate Report'),
    },
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const colors = getColorClasses(action.color);
          
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="quick-action-card group hover:scale-105 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2 rounded-lg"
              data-testid={`action-${action.id}`}
              title={`Navigate to ${action.label}`}
              aria-label={`Navigate to ${action.label}`}
            >
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center transition-all duration-200 mb-3 group-hover:scale-110`}>
                <Icon className={`${colors.icon} text-xl transition-transform duration-200`} size={24} />
              </div>
              <span className="text-sm font-medium text-card-foreground text-center group-hover:text-navy-600 transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}