
import { useState } from 'react';
import { Plus, Search, Filter, Edit3, Trash2 } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  category: string;
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  createdAt: string;
}

const ActivitiesView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      name: 'Morning Workout',
      color: '#8B5CF6',
      frequency: 'daily',
      category: 'Health & Fitness',
      currentStreak: 12,
      bestStreak: 28,
      totalDays: 156,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Daily Journal',
      color: '#10B981',
      frequency: 'daily',
      category: 'Personal Growth',
      currentStreak: 8,
      bestStreak: 15,
      totalDays: 89,
      createdAt: '2024-02-01'
    },
    {
      id: '3',
      name: 'Read Books',
      color: '#F59E0B',
      frequency: 'daily',
      category: 'Learning',
      currentStreak: 5,
      bestStreak: 21,
      totalDays: 67,
      createdAt: '2024-01-20'
    },
    {
      id: '4',
      name: 'Team Meeting Prep',
      color: '#EF4444',
      frequency: 'weekly',
      category: 'Work',
      currentStreak: 3,
      bestStreak: 12,
      totalDays: 34,
      createdAt: '2024-02-10'
    }
  ]);

  const categories = ['all', 'Health & Fitness', 'Personal Growth', 'Learning', 'Work'];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600 mt-1">Manage your habit tracking activities</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Activity
          </button>
        </div>
      </header>

      <main className="p-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-6 h-6 rounded-xl"
                    style={{ backgroundColor: activity.color }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                    <p className="text-gray-500 text-sm">{activity.category} • {activity.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{activity.currentStreak}</div>
                      <div className="text-sm text-gray-500">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{activity.bestStreak}</div>
                      <div className="text-sm text-gray-500">Best</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{activity.totalDays}</div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
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
            <p className="text-gray-500">Try adjusting your search or create a new activity</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivitiesView;
