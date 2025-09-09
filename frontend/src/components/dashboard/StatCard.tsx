
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/icons';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconName;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: string;
}

const StatCard = ({ title, value, subtitle, icon, trend, gradient = "from-blue-500 to-cyan-500" }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:bg-card dark:border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center`}>
              <Icon name={icon} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-gray-600 dark:text-muted-foreground text-sm font-medium">{title}</h3>
              {trend && (
                <div className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-foreground mb-1">{value}</div>
            {subtitle && <p className="text-gray-500 dark:text-muted-foreground text-sm">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
