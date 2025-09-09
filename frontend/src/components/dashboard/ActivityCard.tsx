
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Activity } from '@/lib/activities';

interface ActivityCardProps {
  activity: Activity;
  onComplete: (activityId: number) => void;
}

const ActivityCard = ({ activity, onComplete }: ActivityCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggle = async () => {
    setIsCompleting(true);
    try {
      await onComplete(activity.id);
    } finally {
      setIsCompleting(false);
    }
  };

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

  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: activity.color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">{activity.title}</h3>
            <p className="text-sm text-muted-foreground">{getCategoryDisplay(activity.category)} • {activity.frequency}</p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isCompleting}
          className={`p-2 rounded-full transition-all duration-200 ${
            activity.completed_today
              ? 'text-green-600 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title={activity.completed_today ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleting ? (
            <svg className="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          ) : activity.completed_today ? (
            <Icon name="checkCircle" className="w-6 h-6" />
          ) : (
            <Icon name="circle" className="w-6 h-6" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon name="flame" className="w-4 h-4 text-orange-500" />
            <span className="text-lg font-bold text-card-foreground">{activity.current_streak || 0}</span>
          </div>
          <div className="text-xs text-muted-foreground">Current</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon name="target" className="w-4 h-4 text-blue-500" />
            <span className="text-lg font-bold text-blue-600">{activity.best_streak || 0}</span>
          </div>
          <div className="text-xs text-muted-foreground">Best</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon name="calendar" className="w-4 h-4 text-green-500" />
            <span className="text-lg font-bold text-green-600">{activity.total_completions || 0}</span>
          </div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Weekly Progress</div>
          <div className="text-sm font-medium text-card-foreground">{activity.weekly_progress || 0}%</div>
        </div>
        
        <div className={`text-xs px-2 py-1 rounded-full ${
          activity.completed_today
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {activity.completed_today ? 'Completed' : 'Pending'}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
