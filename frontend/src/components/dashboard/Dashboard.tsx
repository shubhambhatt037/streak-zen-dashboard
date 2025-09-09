
import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import ActivityCard from './ActivityCard';
import ProgressRing from './ProgressRing';
import { activitiesAPI, Activity, DashboardStats } from '@/lib/activities';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';
import CreateActivityDialog from '../activities/CreateActivityDialog';
import { format, startOfWeek, addDays, isToday } from 'date-fns';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useClerkAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to load
    }

    if (!isAuthenticated) {
      setIsLoading(false);
      return; // Don't fetch data if not authenticated
    }

    fetchDashboardData();
  }, [isAuthenticated, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await activitiesAPI.getDashboardStats();
      setDashboardData(data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to recalculate dashboard stats from activities
  function recalculateStats(activities: Activity[]) {
    const total_activities = activities.length;
    const completed_today = activities.filter(a => a.completed_today).length;
    const active_streaks = activities.filter(a => a.current_streak > 0).length;
    const average_streak = total_activities > 0 ? Math.round(activities.reduce((sum, a) => sum + (a.current_streak || 0), 0) / total_activities) : 0;
    // Weekly progress: average of all activities' weekly_progress
    const weekly_progress = total_activities > 0 ? Math.round(activities.reduce((sum, a) => sum + (a.weekly_progress || 0), 0) / total_activities) : 0;
    return { total_activities, completed_today, active_streaks, average_streak, weekly_progress };
  }

  const handleCompleteActivity = async (activityId: number) => {
    if (!dashboardData) return;
    // Find the activity
    const prevActivities = dashboardData.activities;
    const activityIndex = prevActivities.findIndex((a) => a.id === activityId);
    if (activityIndex === -1) return;
    const prevActivity = prevActivities[activityIndex];
    // Optimistically update completed_today
    const updatedActivity = {
      ...prevActivity,
      completed_today: !prevActivity.completed_today,
      current_streak: prevActivity.completed_today ? Math.max(0, prevActivity.current_streak - 1) : prevActivity.current_streak + 1,
      total_completions: prevActivity.completed_today ? Math.max(0, prevActivity.total_completions - 1) : prevActivity.total_completions + 1,
      best_streak: !prevActivity.completed_today && prevActivity.current_streak + 1 > prevActivity.best_streak ? prevActivity.current_streak + 1 : prevActivity.best_streak,
      // Optionally update weekly_progress optimistically here if desired
    };
    const newActivities = [
      ...prevActivities.slice(0, activityIndex),
      updatedActivity,
      ...prevActivities.slice(activityIndex + 1),
    ];
    // Recalculate stats
    const stats = recalculateStats(newActivities);
    setDashboardData({ ...dashboardData, activities: newActivities, ...stats });

    try {
      // Call API
      const result = await activitiesAPI.completeActivity(activityId);
      // Use the returned activity to update the state
      const returnedActivity = result.activity;
      // Use the latest activities array (from optimistic update)
      const latestActivities = [...newActivities];
      latestActivities[activityIndex] = returnedActivity;
      // Recalculate stats with backend-validated activity
      const statsAfter = recalculateStats(latestActivities);
      setDashboardData((prev) => prev ? { ...prev, activities: latestActivities, ...statsAfter } : prev);
    } catch (err: any) {
      // Revert on error
      setDashboardData((prev) => prev ? { ...prev, activities: prevActivities, ...recalculateStats(prevActivities) } : prev);
      // Show toast (using Sonner or Toaster)
      if (window && window['sonner']) {
        window['sonner'].error?.('Failed to update activity. Please try again.');
      } else {
        alert('Failed to update activity. Please try again.');
      }
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
      await fetchDashboardData(); // Refresh dashboard data
    } catch (err: any) {
      console.error('Error creating activity:', err);
      alert('Failed to create activity');
    }
  };

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
          <p className="text-gray-600 dark:text-gray-400">Please sign in to view your dashboard</p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-sm">Debug Info:</p>
            <p className="text-xs">Clerk User: {user ? 'Yes' : 'No'}</p>
            <p className="text-xs">Backend User: {user ? 'Yes' : 'No'}</p>
            <p className="text-xs">Token: {localStorage.getItem('clerk_token') ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const { total_activities, active_streaks, completed_today, average_streak, weekly_progress, activities } = dashboardData;

  // --- Weekly Overview Logic ---
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayIndex = weekDays.findIndex(day => isToday(day));

  return (
    <div className="flex-1 bg-background min-h-screen">
      <header className="bg-card shadow-sm border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-foreground">
              hello, <span className="font-bold">{user?.full_name || user?.first_name || user?.username || 'User'}</span>
            </h1>
            <p className="text-muted-foreground mt-1">Keep up the great work with your habits!</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <CreateActivityDialog onCreateActivity={handleCreateActivity} />
            <p className="text-sm font-medium text-foreground">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Activities"
            value={total_activities}
            subtitle="Activities tracked"
            icon="target"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Active Streaks"
            value={active_streaks}
            subtitle="Currently running"
            icon="flame"
            trend={{ value: "+2 this week", isPositive: true }}
            gradient="from-orange-500 to-red-500"
          />
          <StatCard
            title="Completed Today"
            value={`${completed_today}/${total_activities}`}
            subtitle="Daily progress"
            icon="calendar"
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Average Streak"
            value={average_streak}
            subtitle="Days on average"
            icon="trendingUp"
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* Weekly Overview */}
        <div className="bg-card rounded-2xl p-6 shadow-lg mb-8 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-card-foreground">Weekly Overview</h2>
            <div className="text-sm text-muted-foreground">
              {format(today, 'MMMM yyyy')}
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <ProgressRing progress={weekly_progress} size={150}>
              <div className="text-center">
                <div className="text-2xl font-bold text-card-foreground">{weekly_progress}%</div>
                <div className="text-sm text-muted-foreground">This week</div>
              </div>
            </ProgressRing>
          </div>
          
          <div className="grid grid-cols-7 gap-4 mt-6">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center
                    ${index < todayIndex + 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-muted text-muted-foreground'}
                    ${isToday(day) ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                  `}
                  title={isToday(day) ? 'Today' : ''}
                >
                  {isToday(day) ? <span className="font-bold">{format(day, 'd')}</span> : format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activities Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Your Activities</h2>
          {activities.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onComplete={handleCompleteActivity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No activities yet</div>
              <p className="text-gray-500 dark:text-gray-400">Create your first activity to start tracking</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
