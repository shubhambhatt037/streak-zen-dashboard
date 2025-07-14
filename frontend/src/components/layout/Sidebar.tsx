
import { 
  LayoutDashboard, 
  Target, 
  User, 
  Settings, 
  TrendingUp,
  Calendar,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';
import { useClerk } from '@clerk/clerk-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useClerkAuth();
  const { signOut } = useClerk();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'activities', label: 'Activities', icon: Target },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className={`bg-sidebar text-sidebar-foreground transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen flex flex-col border-r border-sidebar-border flex-shrink-0`}>
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">StreakFlow</h1>
              <p className="text-sidebar-foreground/70 text-sm">Track your habits</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-lg font-medium' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info and Logout */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.first_name?.[0] || user.username[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.first_name || user.username}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
