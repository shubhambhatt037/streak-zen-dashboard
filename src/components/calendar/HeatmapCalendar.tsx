
import { useState } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, startOfWeek, isSameDay } from 'date-fns';

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

  // Group days by weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Add empty cells for the beginning of the first week
  const firstDayOfWeek = getDay(yearStart);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(new Date(0)); // placeholder date
  }

  allDays.forEach((day, index) => {
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Heatmap</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">{currentYear}</div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 mb-2">
          {monthLabels.map((month, index) => (
            <div key={month} className="text-xs text-gray-500 dark:text-gray-400 w-8 text-center">
              {index % 2 === 0 ? month : ''}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-2">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, index) => (
              <div key={index} className="h-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                {day}
              </div>
            ))}
          </div>

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
