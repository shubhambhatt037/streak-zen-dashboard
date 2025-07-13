
import { useState } from 'react';
import { Plus, Target, Flame, Calendar, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import ActivityCard from './ActivityCard';
import ProgressRing from './ProgressRing';

interface Activity {
  id: string;
  name: string;
  color: string;
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  weeklyProgress: number;
  totalDays: number;
}

const Dashboard = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      name: 'Morning Workout',
      color: '#8B5CF6',
      currentStreak: 12,
      bestStreak: 28,
      completedToday: true,
      weeklyProgress: 85,
      totalDays: 156
    },
    {
      id: '2',
      name: 'Daily Journal',
      color: '#10B981',
      currentStreak: 8,
      bestStreak: 15,
      completedToday: false,
      weeklyProgress: 60,
      totalDays: 89
    },
    {
      id: '3',
      name: 'Read Books',
      color: '#F59E0B',
      currentStreak: 5,
      bestStreak: 21,
      completedToday: false,
      weeklyProgress: 70,
      totalDays: 67
    },
    {
      id: '4',
      name: 'Meditation',
      color: '#EF4444',
      currentStreak: 3,
      bestStreak: 12,
      completedToday: true,
      weeklyProgress: 40,
      totalDays: 34
    }
  ]);

  const totalActivities = activities.length;
  const activeStreaks = activities.filter(a => a.currentStreak > 0).length;
  const completedToday = activities.filter(a => a.completedToday).length;
  const averageStreak = Math.round(activities.reduce((sum, a) => sum + a.currentStreak, 0) / totalActivities);

  const handleCompleteActivity = (activityId: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { 
            ...activity, 
            completedToday: true, 
            currentStreak: activity.currentStreak + 1,
            totalDays: activity.totalDays + 1
          }
        : activity
    ));
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hello Olivia</h1>
            <p className="text-gray-600 mt-1">Keep up the great work with your habits!</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Activity
          </button>
        </div>
      </header>

      <main className="p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Activities"
            value={totalActivities}
            subtitle="Activities tracked"
            icon={Target}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Active Streaks"
            value={activeStreaks}
            subtitle="Currently running"
            icon={Flame}
            trend={{ value: "+2 this week", isPositive: true }}
            gradient="from-orange-500 to-red-500"
          />
          <StatCard
            title="Completed Today"
            value={`${completedToday}/${totalActivities}`}
            subtitle="Daily progress"
            icon={Calendar}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Average Streak"
            value={averageStreak}
            subtitle="Days on average"
            icon={TrendingUp}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* Weekly Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Weekly Overview</h2>
            <div className="text-sm text-gray-500">February 2025</div>
          </div>
          
          <div className="flex items-center justify-center">
            <ProgressRing progress={75} size={150}>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">75%</div>
                <div className="text-sm text-gray-500">This week</div>
              </div>
            </ProgressRing>
          </div>
          
          <div className="grid grid-cols-7 gap-4 mt-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm text-gray-500 mb-2">{day}</div>
                <div className={`w-8 h-8 rounded-full mx-auto ${
                  index < 5 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Activities Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Activities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onComplete={handleCompleteActivity}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
