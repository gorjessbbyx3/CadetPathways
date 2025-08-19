import { UserPlus, ClipboardList, Dumbbell, Handshake, Megaphone, FileText } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  action: () => void;
}

const quickActions: QuickAction[] = [
  {
    id: 'add-cadet',
    label: 'Add New Cadet',
    icon: UserPlus,
    color: 'navy',
    action: () => console.log('Add new cadet'),
  },
  {
    id: 'record-incident',
    label: 'Record Incident',
    icon: ClipboardList,
    color: 'red',
    action: () => console.log('Record incident'),
  },
  {
    id: 'fitness-assessment',
    label: 'Fitness Assessment',
    icon: Dumbbell,
    color: 'green',
    action: () => console.log('Fitness assessment'),
  },
  {
    id: 'assign-mentor',
    label: 'Assign Mentor',
    icon: Handshake,
    color: 'purple',
    action: () => console.log('Assign mentor'),
  },
  {
    id: 'send-notice',
    label: 'Send Notice',
    icon: Megaphone,
    color: 'blue',
    action: () => console.log('Send notice'),
  },
  {
    id: 'generate-report',
    label: 'Generate Report',
    icon: FileText,
    color: 'gold',
    action: () => console.log('Generate report'),
  },
];

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
  };
  return colorMap[color as keyof typeof colorMap];
};

export default function QuickActions() {
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
