
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import CreateActivityDialog from './CreateActivityDialog';
import { activitiesAPI, Activity } from '@/lib/activities';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';
import { useApiWithRetry } from '@/hooks/useApiWithRetry';

// Add a map to track loading state for each activity
const ActivitiesView = () => {
  const { isAuthenticated, isLoading: authLoading } = useClerkAuth();
  const { apiCallWithRetry } = useApiWithRetry();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingMap, setLoadingMap] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    fetchActivities();
  }, [isAuthenticated, authLoading]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await activitiesAPI.getActivities();
      setActivities(data);
    } catch (err: any) {
      setError('Failed to load activities');
      console.error('Error fetching activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateActivity = async (newActivity: {
    name: string;
    color: string;
    frequency: 'daily' | 'weekly' | 'custom';
    category: string;
    description: string;
  }) => {
    try {
      const activityData = {
        title: newActivity.name,
        color: newActivity.color,
        frequency: newActivity.frequency,
        category: newActivity.category,
        description: newActivity.description,
        target_days: 1
      };
      
      await activitiesAPI.createActivity(activityData);
      await fetchActivities(); // Refresh the list
    } catch (err: any) {
      console.error('Error creating activity:', err);
      alert('Failed to create activity');
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activitiesAPI.deleteActivity(id);
        await fetchActivities(); // Refresh the list
      } catch (err: any) {
        console.error('Error deleting activity:', err);
        alert('Failed to delete activity');
      }
    }
  };

  const handleEditActivity = (id: number) => {
    // For now, just log the edit action
    console.log('Edit activity:', id);
    alert('Edit functionality coming soon!');
  };

  const handleToggleActivity = async (activityId: number) => {
    // Find the activity
    const prevActivities = activities;
    const activityIndex = prevActivities.findIndex((a) => a.id === activityId);
    if (activityIndex === -1) return;
    const prevActivity = prevActivities[activityIndex];
    // Optimistically update completed_today and counters
    const wasCompleted = prevActivity.completed_today;
    let updatedActivity: Activity = {
      ...prevActivity,
      completed_today: !wasCompleted,
      total_completions: wasCompleted
        ? Math.max(0, prevActivity.total_completions - 1)
        : prevActivity.total_completions + 1,
      current_streak: wasCompleted
        ? Math.max(0, prevActivity.current_streak - 1)
        : prevActivity.current_streak + 1,
      // best_streak: only update if increasing streak
      best_streak: !wasCompleted && prevActivity.current_streak + 1 > prevActivity.best_streak
        ? prevActivity.current_streak + 1
        : prevActivity.best_streak,
    };
    const newActivities = [
      ...prevActivities.slice(0, activityIndex),
      updatedActivity,
      ...prevActivities.slice(activityIndex + 1),
    ];
    setActivities(newActivities);
    setLoadingMap((map) => ({ ...map, [activityId]: true }));
    try {
      // Call API
      const result = await activitiesAPI.completeActivity(activityId);
      const returnedActivity = result.activity;
      const refreshedActivities = [
        ...prevActivities.slice(0, activityIndex),
        returnedActivity,
        ...prevActivities.slice(activityIndex + 1),
      ];
      setActivities(refreshedActivities);
    } catch (err: any) {
      // Revert on error
      setActivities(prevActivities);
      if (window && window['sonner']) {
        window['sonner'].error?.('Failed to update activity. Please try again.');
      } else {
        alert('Failed to update activity. Please try again.');
      }
    } finally {
      setLoadingMap((map) => ({ ...map, [activityId]: false }));
    }
  };

  const categories = ['all', 'health_fitness', 'personal_growth', 'learning', 'work', 'hobbies', 'social', 'wellness', 'other'];

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      'health_fitness': 'Health & Fitness',
      'personal_growth': 'Personal Growth',
      'learning': 'Learning',
      'work': 'Work',
      'hobbies': 'Hobbies',
      'social': 'Social',
      'wellness': 'Wellness',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to view your activities</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchActivities}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activities</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your habit tracking activities</p>
          </div>
          <CreateActivityDialog onCreateActivity={handleCreateActivity} />
        </div>
      </header>

      <main className="p-8">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg mb-8 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Icon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Icon name="filter" className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : getCategoryDisplay(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-6 h-6 rounded-xl"
                    style={{ backgroundColor: activity.color }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{activity.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{getCategoryDisplay(activity.category)} • {activity.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{activity.current_streak || 0}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{activity.best_streak || 0}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Best</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{activity.total_completions || 0}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle completion button */}
                    <button
                      onClick={() => handleToggleActivity(activity.id)}
                      disabled={!!loadingMap[activity.id]}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        activity.completed_today
                          ? 'text-green-600 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={activity.completed_today ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {loadingMap[activity.id] ? (
                        <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                      ) : activity.completed_today ? (
                        <Icon name="checkCircle" className="w-5 h-5" />
                      ) : (
                        <Icon name="circle" className="w-5 h-5" />
                      )}
                    </button>

                    <button 
                      onClick={() => handleEditActivity(activity.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Icon name="user" className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Icon name="logOut" className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No activities found</div>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or create a new activity</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivitiesView;
