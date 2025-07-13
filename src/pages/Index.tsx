
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import ActivitiesView from '@/components/activities/ActivitiesView';
import ProfileView from '@/components/profile/ProfileView';
import CalendarView from '@/components/calendar/CalendarView';
import SettingsView from '@/components/settings/SettingsView';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'activities':
        return <ActivitiesView />;
      case 'profile':
        return <ProfileView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return (
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400">Coming soon - Detailed insights and trends</p>
            </div>
          </div>
        );
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default Index;
