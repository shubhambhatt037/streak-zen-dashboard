
import { useState, useEffect } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, startOfWeek, isSameDay, getMonth } from 'date-fns';
import { activitiesAPI, CalendarEntry } from '@/lib/activities';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';
import { useApiWithRetry } from '@/hooks/useApiWithRetry';

interface ActivityData {
  date: string;
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}

const HeatmapCalendar = () => {
  const { isAuthenticated, isLoading: authLoading } = useClerkAuth();
  const { apiCallWithRetry } = useApiWithRetry();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 0, 1));

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    fetchCalendarData();
  }, [isAuthenticated, authLoading]);

  const fetchCalendarData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get calendar data for the entire year
      const startDate = format(yearStart, 'yyyy-MM-dd');
      const endDate = format(yearEnd, 'yyyy-MM-dd');
      
      const calendarEntries: CalendarEntry[] = await apiCallWithRetry(() => activitiesAPI.getCalendarEntries(startDate, endDate));
      
      // Transform the data to calculate completion percentages
      const transformedData: ActivityData[] = calendarEntries.map(entry => ({
        date: entry.date,
        completedCount: entry.total_completed,
        totalCount: entry.total_activities,
        completionPercentage: entry.total_activities > 0 
          ? (entry.total_completed / entry.total_activities) * 100 
          : 0
      }));
      
      setActivityData(transformedData);
    } catch (err: any) {
      setError('Failed to load calendar data');
      console.error('Error fetching calendar data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
  
  const getActivityData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return activityData.find(a => a.date === dateStr) || {
      date: dateStr,
      completedCount: 0,
      totalCount: 0,
      completionPercentage: 0
    };
  };

  const getIntensityColor = (completionPercentage: number) => {
    if (completionPercentage === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (completionPercentage <= 20) return 'bg-green-200 dark:bg-green-900/30';
    if (completionPercentage <= 40) return 'bg-green-300 dark:bg-green-800/50';
    if (completionPercentage <= 60) return 'bg-green-400 dark:bg-green-700/70';
    if (completionPercentage <= 80) return 'bg-green-500 dark:bg-green-600/80';
    return 'bg-green-600 dark:bg-green-500'; // 100% completion
  };

  // Group days by weeks starting from Sunday
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Add empty cells for the beginning of the first week (if needed)
  const firstDayOfWeek = getDay(yearStart); // 0 = Sunday, 1 = Monday, etc.
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(new Date(0)); // placeholder date
  }

  allDays.forEach((day) => {
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Add remaining days to the last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(0)); // placeholder date
    }
    weeks.push(currentWeek);
  }

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate month positions for labels
  const getMonthPositions = () => {
    const positions: { month: string; position: number }[] = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        if (day.getTime() !== 0) { // not a placeholder
          const month = getMonth(day);
          if (month !== currentMonth) {
            currentMonth = month;
            positions.push({
              month: monthLabels[month],
              position: weekIndex * 16 // 16px = w-4 (1rem) + gap
            });
          }
        }
      });
    });
    
    return positions;
  };

  const monthPositions = getMonthPositions();

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to view your calendar</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchCalendarData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Heatmap</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">{currentYear}</div>
      </div>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="relative mb-2 h-4">
          {monthPositions.map((pos, index) => (
            <div 
              key={index}
              className="absolute text-xs text-gray-500 dark:text-gray-400"
              style={{ left: `${pos.position + 32}px` }}
            >
              {pos.month}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2 w-8">
            {dayLabels.map((day, index) => (
              <div key={index} className="h-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const isPlaceholder = day.getTime() === 0;
                  const dayData = isPlaceholder ? null : getActivityData(day);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        w-3 h-3 rounded-sm transition-colors
                        ${isPlaceholder ? 'opacity-0' : getIntensityColor(dayData?.completionPercentage || 0)}
                        ${!isPlaceholder ? 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 cursor-pointer' : ''}
                      `}
                      title={isPlaceholder ? '' : `${format(day, 'MMM d, yyyy')}: ${dayData?.completedCount || 0}/${dayData?.totalCount || 0} activities (${Math.round(dayData?.completionPercentage || 0)}%)`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            No activities
          </div>
          <div className="flex gap-1 items-center">
            {[0, 20, 40, 60, 80, 100].map((percentage) => (
              <div
                key={percentage}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(percentage)}`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            All activities completed
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
