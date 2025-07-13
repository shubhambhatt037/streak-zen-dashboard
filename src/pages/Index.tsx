
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import ActivitiesView from '@/components/activities/ActivitiesView';
import ProfileView from '@/components/profile/ProfileView';

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
        return (
          <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Calendar View</h2>
              <p className="text-gray-600">Coming soon - Visual calendar with streak tracking</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
              <p className="text-gray-600">Coming soon - Detailed insights and trends</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Coming soon - App preferences and notifications</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default Index;
