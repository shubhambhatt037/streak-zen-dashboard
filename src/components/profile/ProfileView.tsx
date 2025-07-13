
import { User, Mail, Calendar, Award, Target, Flame } from 'lucide-react';

const ProfileView = () => {
  const userStats = {
    totalActivities: 4,
    totalStreaks: 28,
    longestStreak: 28,
    daysActive: 156,
    joinDate: 'January 2024',
    completionRate: 78
  };

  const achievements = [
    { id: 1, name: 'First Streak', description: 'Complete your first 7-day streak', achieved: true, icon: '🔥' },
    { id: 2, name: 'Consistency Master', description: 'Maintain 3 activities for 30 days', achieved: true, icon: '💪' },
    { id: 3, name: 'Early Bird', description: 'Complete morning activities for 14 days', achieved: false, icon: '🌅' },
    { id: 4, name: 'Goal Getter', description: 'Reach 50-day streak on any activity', achieved: false, icon: '🎯' },
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Your habit tracking journey and achievements</p>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Olivia Johnson</h2>
                <p className="text-gray-500">Habit Tracker Enthusiast</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>olivia@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Member since {userStats.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-600">Total Activities</span>
                  </div>
                  <span className="font-semibold text-gray-900">{userStats.totalActivities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-600">Total Streaks</span>
                  </div>
                  <span className="font-semibold text-gray-900">{userStats.totalStreaks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-600">Longest Streak</span>
                  </div>
                  <span className="font-semibold text-gray-900">{userStats.longestStreak} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{userStats.daysActive}</div>
                  <div className="text-sm text-gray-500">Days Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{userStats.completionRate}%</div>
                  <div className="text-sm text-gray-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{userStats.longestStreak}</div>
                  <div className="text-sm text-gray-500">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{userStats.totalActivities}</div>
                  <div className="text-sm text-gray-500">Active Goals</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      achievement.achieved 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${achievement.achieved ? 'text-green-800' : 'text-gray-600'}`}>
                          {achievement.name}
                        </h4>
                        <p className={`text-sm ${achievement.achieved ? 'text-green-600' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                        {achievement.achieved && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
