import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Shield, 
  Gauge, 
  Users, 
  ClipboardList, 
  Dumbbell, 
  Handshake, 
  GraduationCap, 
  Bus, 
  MessageSquare, 
  BarChart, 
  LogOut 
} from "lucide-react";

const navigationItems = [
  { href: "/dashboard", icon: Gauge, label: "Dashboard" },
  { href: "/cadet-management", icon: Users, label: "Cadet Management" },
  { href: "/behavior-tracking", icon: ClipboardList, label: "Behavior Tracking" },
  { href: "/physical-fitness", icon: Dumbbell, label: "Physical Fitness" },
  { href: "/mentorship-program", icon: Handshake, label: "Mentorship Program" },
  { href: "/career-pathways", icon: GraduationCap, label: "Career Pathways" },
  { href: "/staff-management", icon: Bus, label: "Staff Management" },
  { href: "/communications", icon: MessageSquare, label: "Communications" },
  { href: "/analytics-reports", icon: BarChart, label: "Analytics & Reports" },
];

export default function SidebarNavigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 military-sidebar text-white flex flex-col">
      {/* Academy Logo & Header */}
      <div className="p-6 border-b border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 academy-badge rounded-lg flex items-center justify-center">
            <Shield className="text-navy-900 text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold">HINGUAL</h1>
            <p className="text-sm text-navy-300">Youth Challenge Academy</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={isActive ? "nav-item-active" : "nav-item-inactive"}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 academy-badge rounded-full flex items-center justify-center">
            <Bus className="text-navy-900" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" data-testid="user-name">
              {user?.name || "Loading..."}
            </p>
            <p className="text-xs text-navy-300" data-testid="user-role">
              {user?.role || ""}
            </p>
          </div>
          <button 
            onClick={logout}
            className="text-navy-300 hover:text-white"
            data-testid="button-logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
