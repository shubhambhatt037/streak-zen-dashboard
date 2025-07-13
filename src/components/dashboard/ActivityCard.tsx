
import { MoreHorizontal, Flame, Calendar, Target } from 'lucide-react';
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

interface ActivityCardProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  onComplete?: (activityId: string) => void;
}

const ActivityCard = ({ activity, onEdit, onComplete }: ActivityCardProps) => {
  const progressPercentage = (activity.currentStreak / Math.max(activity.bestStreak, 1)) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: activity.color }}
          />
          <h3 className="font-semibold text-gray-900">{activity.name}</h3>
        </div>
        <button 
          onClick={() => onEdit?.(activity)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{activity.currentStreak}</div>
              <div className="text-sm text-gray-500">Current streak</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-lg font-semibold text-gray-700">{activity.bestStreak}</div>
              <div className="text-sm text-gray-500">Best streak</div>
            </div>
          </div>
        </div>

        <ProgressRing progress={progressPercentage} size={100}>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-gray-500">Progress</div>
          </div>
        </ProgressRing>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{activity.totalDays} days total</span>
        </div>
        
        <button
          onClick={() => onComplete?.(activity.id)}
          disabled={activity.completedToday}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activity.completedToday
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
          }`}
        >
          {activity.completedToday ? 'Completed' : 'Mark Done'}
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;
