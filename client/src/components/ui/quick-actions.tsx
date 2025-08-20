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
  
  const quickActions: QuickAction[] = [
    {
      id: 'add-cadet',
      label: 'Add New Cadet',
      icon: UserPlus,
      color: 'navy',
      action: () => navigate('/cadet-management'),
    },
    {
      id: 'record-incident',
      label: 'Record Incident',
      icon: ClipboardList,
      color: 'red',
      action: () => navigate('/behavior-tracking'),
    },
    {
      id: 'fitness-assessment',
      label: 'Fitness Assessment',
      icon: Dumbbell,
      color: 'green',
      action: () => navigate('/physical-fitness'),
    },
    {
      id: 'assign-mentor',
      label: 'Assign Mentor',
      icon: Handshake,
      color: 'purple',
      action: () => navigate('/mentorship-program'),
    },
    {
      id: 'academic-timetable',
      label: 'Academic Timetable',
      icon: Calendar,
      color: 'orange',
      action: () => navigate('/academic-timetable'),
    },
    {
      id: 'assignment-management',
      label: 'Assignments',
      icon: BookOpen,
      color: 'blue',
      action: () => navigate('/assignment-management'),
    },
    {
      id: 'mock-tests',
      label: 'Mock Tests',
      icon: Trophy,
      color: 'purple',
      action: () => navigate('/mock-tests'),
    },
    {
      id: 'class-diary',
      label: 'Class Diary',
      icon: NotebookPen,
      color: 'green',
      action: () => navigate('/class-diary'),
    },
    {
      id: 'send-notice',
      label: 'Send Notice',
      icon: Megaphone,
      color: 'navy',
      action: () => navigate('/communications'),
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      color: 'gold',
      action: () => navigate('/analytics-reports'),
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
              className="quick-action-card"
              data-testid={`action-${action.id}`}
            >
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center transition-colors mb-3`}>
                <Icon className={`${colors.icon} text-xl`} size={24} />
              </div>
              <span className="text-sm font-medium text-card-foreground text-center">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}