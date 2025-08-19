import { AlertTriangle, Calendar, UserPlus } from "lucide-react";

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'reminder';
  title: string;
  description: string;
  action: string;
}

const alerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: '3 Cadets Require Immediate Attention',
    description: 'Academic performance below threshold',
    action: 'Review Now',
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Graduation Ceremony Planning',
    description: '42 cadets scheduled for June graduation',
    action: 'Plan Event',
  },
  {
    id: '3',
    type: 'info',
    title: 'New Staff Orientation',
    description: '5 new instructors require onboarding',
    action: 'Schedule Training',
  },
];

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'warning': return AlertTriangle;
    case 'reminder': return Calendar;
    case 'info': return UserPlus;
    default: return AlertTriangle;
  }
};

const getAlertStyles = (type: string) => {
  switch (type) {
    case 'warning': 
      return {
        container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
        icon: 'text-red-500',
        title: 'text-red-800 dark:text-red-400',
        description: 'text-red-600 dark:text-red-300',
        action: 'text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300',
      };
    case 'reminder':
      return {
        container: 'bg-academy-gold/10 border-academy-gold/30',
        icon: 'text-academy-gold',
        title: 'text-gray-800 dark:text-gray-200',
        description: 'text-gray-600 dark:text-gray-300',
        action: 'text-academy-gold hover:opacity-80',
      };
    case 'info':
      return {
        container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
        icon: 'text-blue-500',
        title: 'text-blue-800 dark:text-blue-400',
        description: 'text-blue-600 dark:text-blue-300',
        action: 'text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
      };
    default:
      return {
        container: 'bg-gray-50 border-gray-200',
        icon: 'text-gray-500',
        title: 'text-gray-800',
        description: 'text-gray-600',
        action: 'text-gray-700 hover:text-gray-800',
      };
  }
};

export default function AlertsPanel() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-card-foreground">Alerts & Notifications</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const styles = getAlertStyles(alert.type);
            
            return (
              <div 
                key={alert.id} 
                className={`p-4 border rounded-lg ${styles.container}`}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`${styles.icon} mt-1`} size={16} />
                  <div>
                    <p className={`text-sm font-medium ${styles.title}`} data-testid={`alert-title-${alert.id}`}>
                      {alert.title}
                    </p>
                    <p className={`text-xs mt-1 ${styles.description}`} data-testid={`alert-description-${alert.id}`}>
                      {alert.description}
                    </p>
                    <button 
                      className={`text-xs font-medium mt-2 ${styles.action}`}
                      data-testid={`alert-action-${alert.id}`}
                    >
                      {alert.action}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
