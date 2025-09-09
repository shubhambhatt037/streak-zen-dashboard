
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';
import { activitiesAPI, UserProfileStats } from '@/lib/activities';

const ProfileView = () => {
  const { user: clerkUser, isAuthenticated, isLoading: authLoading } = useClerkAuth();
  const [profileData, setProfileData] = useState<UserProfileStats | null>(null);
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

    fetchProfileData();
  }, [isAuthenticated, authLoading]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await activitiesAPI.getUserProfileStats();
      setProfileData(data);
    } catch (err: any) {
      setError('Failed to load profile data');
      console.error('Error fetching profile data:', err);
    } finally {
      setIsLoading(false);
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
          <p className="text-gray-600 dark:text-gray-400">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
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
            onClick={fetchProfileData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No profile data available</p>
        </div>
      </div>
    );
  }

  const { user, stats, achievements } = profileData;
  const joinDate = user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  return (
    <div className="flex-1 bg-background min-h-screen">
      <header className="bg-card shadow-sm border-b border-border px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Your habit tracking journey and achievements</p>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="user" className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-card-foreground">
                  {user.full_name || user.first_name || user.username || 'User'}
                </h2>
                <p className="text-muted-foreground">
                  {user.bio}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="user" className="w-5 h-5" />
                  <span>{user.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="calendar" className="w-5 h-5" />
                  <span>Member since {joinDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="target" className="w-5 h-5 text-blue-500" />
                    <span className="text-muted-foreground">Total Activities</span>
                  </div>
                  <span className="font-semibold text-card-foreground">{stats.total_activities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="flame" className="w-5 h-5 text-orange-500" />
                    <span className="text-muted-foreground">Total Streaks</span>
                  </div>
                  <span className="font-semibold text-card-foreground">{stats.total_streaks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="trendingUp" className="w-5 h-5 text-purple-500" />
                    <span className="text-muted-foreground">Longest Streak</span>
                  </div>
                  <span className="font-semibold text-card-foreground">{stats.longest_streak} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Overview */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <h3 className="text-xl font-bold text-card-foreground mb-6">Performance Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{stats.days_active}</div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.completion_rate}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{stats.longest_streak}</div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stats.total_activities}</div>
                  <div className="text-sm text-muted-foreground">Active Goals</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <h3 className="text-xl font-bold text-card-foreground mb-6">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      achievement.achieved 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' 
                        : 'border-border bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${achievement.achieved ? 'text-green-800 dark:text-green-400' : 'text-muted-foreground'}`}>
                          {achievement.name}
                        </h4>
                        <p className={`text-sm ${achievement.achieved ? 'text-green-600 dark:text-green-300' : 'text-muted-foreground'}`}>
                          {achievement.description}
                        </p>
                        {achievement.achieved && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Achieved
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileView;
