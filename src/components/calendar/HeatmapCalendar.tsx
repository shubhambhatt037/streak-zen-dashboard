
import { useState } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, startOfWeek, isSameDay, getMonth } from 'date-fns';

interface ActivityData {
  date: string;
  count: number;
}

const HeatmapCalendar = () => {
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 0, 1));
  
  // Sample activity data - replace with real data
  const [activityData] = useState<ActivityData[]>([
    { date: '2024-01-15', count: 3 },
    { date: '2024-01-16', count: 2 },
    { date: '2024-02-10', count: 4 },
    { date: '2024-02-11', count: 1 },
    { date: '2024-03-05', count: 5 },
    // Add more sample data as needed
  ]);

  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
  
  const getIntensity = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const activity = activityData.find(a => a.date === dateStr);
    return activity ? activity.count : 0;
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity === 1) return 'bg-green-200 dark:bg-green-900';
    if (intensity === 2) return 'bg-green-300 dark:bg-green-800';
    if (intensity === 3) return 'bg-green-400 dark:bg-green-700';
    if (intensity === 4) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
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
                  const intensity = isPlaceholder ? 0 : getIntensity(day);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        w-3 h-3 rounded-sm transition-colors
                        ${isPlaceholder ? 'opacity-0' : getIntensityColor(intensity)}
                        ${!isPlaceholder ? 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 cursor-pointer' : ''}
                      `}
                      title={isPlaceholder ? '' : `${format(day, 'MMM d, yyyy')}: ${intensity} activities`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Less active
          </div>
          <div className="flex gap-1 items-center">
            {[0, 1, 2, 3, 4, 5].map((intensity) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            More active
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
