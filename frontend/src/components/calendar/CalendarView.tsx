
import HeatmapCalendar from './HeatmapCalendar';

const CalendarView = () => {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Visual calendar with streak tracking</p>
          </div>
        </div>
      </header>

      <main className="p-8">
        <HeatmapCalendar />
      </main>
    </div>
  );
};

export default CalendarView;
